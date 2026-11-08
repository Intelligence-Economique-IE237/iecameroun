"""Traduction automatique du site et du panneau admin.

Fonctionnement :
1. le navigateur envoie les textes visibles de la page (en français) ;
2. ceux déjà traduits sont lus dans la table `traduction` (cache permanent) ;
3. seuls les nouveaux partent vers le service externe, puis sont enregistrés.

Une page n'est donc traduite qu'une seule fois, quel que soit le nombre de visiteurs :
le quota gratuit de DeepL (500 000 caractères/mois) ne sert qu'aux textes nouveaux.

La terminologie d'IE237 (src/core/glossaire.py) est imposée : textes identiques remplacés
directement, et glossaire DeepL pour les termes à l'intérieur des phrases.

Services pris en charge (le premier configuré est utilisé) :
- DeepL API Free  → DEEPL_API_KEY       (meilleure qualité, gratuit jusqu'à 500 000 car./mois)
- LibreTranslate  → LIBRETRANSLATE_URL  (logiciel libre, auto-hébergeable, sans quota)
"""
import hashlib
import json
import re
import logging
import threading
import time
import urllib.error
import urllib.request
from collections import defaultdict

from sqlmodel import Session, select

from src.core import config
from src.core.glossaire import CORRECTIONS, GLOSSAIRE
from src.core.erreurs import DonneesInvalides, ServiceIndisponible, TropDeRequetes
from src.models.traduction import Traduction
from src.schemas.traduction import MAX_LONGUEUR_TEXTE

journal = logging.getLogger(__name__)

LANGUE_SOURCE = "fr"
DELAI_RESEAU = 20  # secondes

# DeepL attend parfois une variante régionale
_CODES_DEEPL = {"en": "EN-GB", "pt": "PT-PT", "zh": "ZH-HANS"}


# ---------- Glossaire ----------

def _normaliser(texte: str) -> str:
    return " ".join(texte.split()).casefold()


def signature(cible: str) -> str:
    """Change dès que le glossaire de cette langue change (invalide alors le cache)."""
    entrees = sorted(GLOSSAIRE.get(cible, {}).items())
    return hashlib.sha256(json.dumps(entrees, ensure_ascii=False).encode("utf-8")).hexdigest()[:12]


def version() -> str:
    """Version globale, transmise aux navigateurs pour qu'ils vident leur cache local."""
    contenu = "|".join(signature(l) for l in config.TRADUCTION_LANGUES)
    contenu += json.dumps(sorted((l, sorted(c.items())) for l, c in CORRECTIONS.items()), ensure_ascii=False)
    return hashlib.sha256(contenu.encode("utf-8")).hexdigest()[:12]


def _avec_casse(modele: str, remplacement: str) -> str:
    if modele.isupper():
        return remplacement.upper()
    if modele[:1].isupper():
        return remplacement[:1].upper() + remplacement[1:]
    return remplacement


def corriger(texte: str, cible: str) -> str:
    """Remplace les termes anglais indésirables (CORRECTIONS), en gardant les majuscules."""
    for faux, juste in CORRECTIONS.get(cible, {}).items():
        motif = re.compile(rf"\b{re.escape(faux)}\b", re.IGNORECASE)
        texte = motif.sub(lambda m, j=juste: _avec_casse(m.group(0), j), texte)
    return texte


def _expressions(cible: str) -> dict[str, str]:
    return {_normaliser(source): texte for source, texte in GLOSSAIRE.get(cible, {}).items()}


def empreinte(texte: str, cible: str = "") -> str:
    return hashlib.sha256(f"{signature(cible)}\n{texte}".encode("utf-8")).hexdigest()


def service_actif() -> str | None:
    if config.DEEPL_API_KEY:
        return "deepl"
    if config.LIBRETRANSLATE_URL:
        return "libretranslate"
    return None


# ---------- Appels aux services externes ----------

def _appel(methode: str, url: str, corps: dict | None, entetes: dict) -> dict:
    requete = urllib.request.Request(
        url,
        data=json.dumps(corps).encode("utf-8") if corps is not None else None,
        headers={"Content-Type": "application/json", "User-Agent": "IE237-API", **entetes},
        method=methode,
    )
    try:
        with urllib.request.urlopen(requete, timeout=DELAI_RESEAU) as reponse:
            contenu = reponse.read()
            return json.loads(contenu.decode("utf-8")) if contenu else {}
    except urllib.error.HTTPError as e:
        journal.warning("Traduction : %s a répondu %s", url, e.code)
        if e.code == 456:  # code DeepL : quota mensuel épuisé
            raise ServiceIndisponible("Quota mensuel de traduction atteint") from e
        if e.code in (403, 401):
            raise ServiceIndisponible("Clé du service de traduction invalide") from e
        raise ServiceIndisponible("Service de traduction indisponible") from e
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        journal.warning("Traduction : %s injoignable (%s)", url, e)
        raise ServiceIndisponible("Service de traduction injoignable") from e


def _post_json(url: str, corps: dict, entetes: dict) -> dict:
    return _appel("POST", url, corps, entetes)


def _par_lots(textes: list[str], taille: int):
    for i in range(0, len(textes), taille):
        yield textes[i : i + taille]


# Glossaires DeepL déjà créés : nom → (id ou None si échec, instant)
_glossaires_deepl: dict[str, tuple[str | None, float]] = {}


def _glossaire_deepl(hote: str, auth: dict, cible: str) -> str | None:
    """Renvoie l'id du glossaire DeepL de cette langue, en le créant au besoin.

    Les glossaires DeepL ne sont pas modifiables : chaque version du glossaire a son
    propre nom (ie237-fr-en-<signature>) et les anciennes versions sont supprimées.
    En cas d'échec, on traduit sans glossaire et on réessaie 10 minutes plus tard.
    """
    entrees = GLOSSAIRE.get(cible)
    if not entrees:
        return None
    prefixe = f"ie237-{LANGUE_SOURCE}-{cible}-"
    nom = prefixe + signature(cible)
    if nom in _glossaires_deepl:
        identifiant, instant = _glossaires_deepl[nom]
        if identifiant or time.monotonic() - instant < 600:
            return identifiant

    identifiant = None
    try:
        existants = _appel("GET", f"{hote}/v2/glossaries", None, auth).get("glossaries", [])
        identifiant = next((g["glossary_id"] for g in existants if g.get("name") == nom), None)
        if not identifiant:
            tsv = "\n".join(f"{source}\t{texte}" for source, texte in entrees.items())
            identifiant = _post_json(
                f"{hote}/v2/glossaries",
                {"name": nom, "source_lang": LANGUE_SOURCE, "target_lang": cible,
                 "entries": tsv, "entries_format": "tsv"},
                auth,
            )["glossary_id"]
            for ancien in existants:
                if ancien.get("name", "").startswith(prefixe) and ancien.get("name") != nom:
                    try:
                        _appel("DELETE", f"{hote}/v2/glossaries/{ancien['glossary_id']}", None, auth)
                    except ServiceIndisponible:
                        pass
    except (ServiceIndisponible, KeyError) as e:
        journal.warning("Glossaire DeepL indisponible, traduction sans glossaire : %s", e)
        identifiant = None
    _glossaires_deepl[nom] = (identifiant, time.monotonic())
    return identifiant


def _deepl(textes: list[str], cible: str) -> list[str]:
    cle = config.DEEPL_API_KEY
    hote = "https://api-free.deepl.com" if cle.endswith(":fx") else "https://api.deepl.com"
    auth = {"Authorization": f"DeepL-Auth-Key {cle}"}
    glossaire = _glossaire_deepl(hote, auth, cible)
    resultat: list[str] = []
    for lot in _par_lots(textes, 50):  # DeepL : 50 textes maximum par requête
        corps = {
            "text": lot,
            "source_lang": LANGUE_SOURCE.upper(),
            "target_lang": _CODES_DEEPL.get(cible, cible.upper()),
            "preserve_formatting": True,
        }
        if glossaire:
            corps["glossary_id"] = glossaire
        reponse = _post_json(f"{hote}/v2/translate", corps, auth)
        resultat += [t["text"] for t in reponse["translations"]]
    return resultat


def _libretranslate(textes: list[str], cible: str) -> list[str]:
    resultat: list[str] = []
    for lot in _par_lots(textes, 50):
        corps = {"q": lot, "source": LANGUE_SOURCE, "target": cible, "format": "text"}
        if config.LIBRETRANSLATE_API_KEY:
            corps["api_key"] = config.LIBRETRANSLATE_API_KEY
        reponse = _post_json(f"{config.LIBRETRANSLATE_URL}/translate", corps, {})
        traduit = reponse["translatedText"]
        resultat += traduit if isinstance(traduit, list) else [traduit]
    return resultat


def _traduire_externe(textes: list[str], cible: str) -> list[str]:
    service = service_actif()
    if service is None:
        raise ServiceIndisponible("Traduction automatique non configurée")
    traduits = _deepl(textes, cible) if service == "deepl" else _libretranslate(textes, cible)
    if len(traduits) != len(textes):
        raise ServiceIndisponible("Réponse inattendue du service de traduction")
    return traduits


# ---------- Limite par visiteur (protège le quota gratuit) ----------

_consommation: dict[str, list[tuple[float, int]]] = defaultdict(list)
_verrou = threading.Lock()


def _verifier_quota(ip: str, caracteres: int) -> None:
    limite = config.TRADUCTION_QUOTA_IP_HEURE
    if limite <= 0:
        return
    il_y_a_une_heure = time.monotonic() - 3600
    with _verrou:
        historique = [(t, n) for t, n in _consommation[ip] if t > il_y_a_une_heure]
        if sum(n for _, n in historique) + caracteres > limite:
            _consommation[ip] = historique
            raise TropDeRequetes("Trop de traductions demandées. Réessayez plus tard.")
        historique.append((time.monotonic(), caracteres))
        _consommation[ip] = historique


def reinitialiser_quotas() -> None:
    with _verrou:
        _consommation.clear()


# ---------- Point d'entrée ----------

def traduire(session: Session, textes: list[str], cible: str, ip: str = "") -> list[str]:
    cible = cible.lower()
    if cible == LANGUE_SOURCE:
        return list(textes)
    if cible not in config.TRADUCTION_LANGUES:
        raise DonneesInvalides(f"Langue non proposée : {cible}")
    if any(len(t) > MAX_LONGUEUR_TEXTE for t in textes):
        raise DonneesInvalides(f"Texte trop long (maximum {MAX_LONGUEUR_TEXTE} caractères)")

    # Les textes vides ou sans lettre (chiffres, ponctuation) ne sont pas envoyés
    a_traduire = {t for t in textes if t.strip() and any(c.isalpha() for c in t)}
    resultats: dict[str, str] = {}

    # Textes identiques à une entrée du glossaire : traduction imposée, sans appel externe
    expressions = _expressions(cible)
    for t in list(a_traduire):
        impose = expressions.get(_normaliser(t))
        if impose is not None:
            resultats[t] = impose
            a_traduire.discard(t)

    if a_traduire:
        par_empreinte = {empreinte(t, cible): t for t in a_traduire}
        connues = session.exec(
            select(Traduction).where(
                Traduction.langue == cible, Traduction.empreinte.in_(list(par_empreinte))
            )
        ).all()
        for ligne in connues:
            resultats[par_empreinte[ligne.empreinte]] = ligne.texte

        nouveaux = sorted(a_traduire - resultats.keys())
        if nouveaux:
            _verifier_quota(ip, sum(len(t) for t in nouveaux))
            for source, texte in zip(nouveaux, _traduire_externe(nouveaux, cible)):
                resultats[source] = texte
                session.add(Traduction(langue=cible, empreinte=empreinte(source, cible), source=source, texte=texte))
            try:
                session.commit()
            except Exception:  # deux visiteurs ont traduit le même texte en même temps : sans gravité
                session.rollback()

    # Les traductions imposées par le glossaire ne sont pas retouchées
    imposes = {t for t in resultats if _normaliser(t) in expressions}
    return [
        resultats[t] if t in imposes else corriger(resultats[t], cible) if t in resultats else t
        for t in textes
    ]
