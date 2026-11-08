"""Traduction automatique : le service externe est simulé (aucun appel réseau)."""
import pytest

from src.core import config, glossaire
from src.services import traduction_service


@pytest.fixture()
def faux_service(monkeypatch):
    """Remplace DeepL par une fausse traduction et compte les textes envoyés."""
    envoyes: list[str] = []

    def traduire_externe(textes, cible):
        envoyes.extend(textes)
        return [f"[{cible}] {t}" for t in textes]

    monkeypatch.setattr(config, "DEEPL_API_KEY", "cle-de-test:fx")
    monkeypatch.setattr(config, "TRADUCTION_LANGUES", ["en"])
    monkeypatch.setattr(traduction_service, "_traduire_externe", traduire_externe)
    traduction_service.reinitialiser_quotas()
    return envoyes


def test_langues(client, faux_service):
    r = client.get("/traduction/langues")
    assert r.status_code == 200
    corps = r.json()
    assert {k: corps[k] for k in ("source", "cibles", "active")} == {"source": "fr", "cibles": ["en"], "active": True}
    assert len(corps["version"]) == 12


def test_traduit_et_garde_l_ordre(client, faux_service):
    r = client.post("/traduction", json={"cible": "en", "textes": ["Bonjour", "Nos offres", "2026", ""]})
    assert r.status_code == 200
    assert r.json()["traductions"] == ["[en] Bonjour", "[en] Nos offres", "2026", ""]
    # Ni les nombres ni les textes vides ne partent vers le service
    assert sorted(faux_service) == ["Bonjour", "Nos offres"]


def test_cache_un_texte_n_est_traduit_qu_une_fois(client, faux_service):
    client.post("/traduction", json={"cible": "en", "textes": ["Actualités", "Événements"]})
    faux_service.clear()
    r = client.post("/traduction", json={"cible": "en", "textes": ["Événements", "Actualités", "Galerie", "Galerie"]})
    assert r.json()["traductions"] == ["[en] Événements", "[en] Actualités", "[en] Galerie", "[en] Galerie"]
    assert faux_service == ["Galerie"]


def test_francais_renvoye_tel_quel(client, faux_service):
    r = client.post("/traduction", json={"cible": "fr", "textes": ["Bonjour"]})
    assert r.json()["traductions"] == ["Bonjour"]
    assert faux_service == []


def test_langue_non_proposee(client, faux_service):
    r = client.post("/traduction", json={"cible": "de", "textes": ["Bonjour"]})
    assert r.status_code == 400


def test_trop_de_textes(client, faux_service):
    r = client.post("/traduction", json={"cible": "en", "textes": ["a"] * 101})
    assert r.status_code == 422


def test_quota_par_visiteur(client, faux_service, monkeypatch):
    monkeypatch.setattr(config, "TRADUCTION_QUOTA_IP_HEURE", 20)
    assert client.post("/traduction", json={"cible": "en", "textes": ["Un texte court"]}).status_code == 200
    r = client.post("/traduction", json={"cible": "en", "textes": ["Un autre texte nouveau"]})
    assert r.status_code == 429
    # Le cache reste servi même quota atteint
    assert client.post("/traduction", json={"cible": "en", "textes": ["Un texte court"]}).status_code == 200


def test_sans_service_configure(client, monkeypatch):
    monkeypatch.setattr(config, "DEEPL_API_KEY", "")
    monkeypatch.setattr(config, "LIBRETRANSLATE_URL", "")
    monkeypatch.setattr(config, "TRADUCTION_LANGUES", ["en"])
    assert client.get("/traduction/langues").json()["active"] is False
    assert client.post("/traduction", json={"cible": "en", "textes": ["Bonjour"]}).status_code == 503


def test_glossaire_texte_identique_impose(client, faux_service, monkeypatch):
    monkeypatch.setattr(glossaire, "GLOSSAIRE", {"en": {"Veille & analyse concurrentielle": "Competitor monitoring & analysis"}})
    monkeypatch.setattr(traduction_service, "GLOSSAIRE", glossaire.GLOSSAIRE)
    # Majuscules et espaces ne comptent pas ; le service externe n'est pas appelé
    r = client.post("/traduction", json={"cible": "en", "textes": ["veille &  analyse CONCURRENTIELLE"]})
    assert r.json()["traductions"] == ["Competitor monitoring & analysis"]
    assert faux_service == []


def test_glossaire_modifie_retraduit_le_cache(client, faux_service, monkeypatch):
    monkeypatch.setattr(traduction_service, "GLOSSAIRE", {"en": {"veille": "watch"}})
    client.post("/traduction", json={"cible": "en", "textes": ["Une phrase avec de la veille"]})
    monkeypatch.setattr(traduction_service, "GLOSSAIRE", {"en": {"veille": "monitoring"}})
    faux_service.clear()
    client.post("/traduction", json={"cible": "en", "textes": ["Une phrase avec de la veille"]})
    assert faux_service == ["Une phrase avec de la veille"]  # retraduite avec le nouveau glossaire


def test_corrections_apres_traduction(client, monkeypatch):
    monkeypatch.setattr(config, "DEEPL_API_KEY", "cle:fx")
    monkeypatch.setattr(config, "TRADUCTION_LANGUES", ["en"])
    monkeypatch.setattr(traduction_service, "_traduire_externe", lambda textes, cible: [
        "Experts in business intelligence. Business Intelligence matters. BUSINESS INTELLIGENCE." for _ in textes
    ])
    traduction_service.reinitialiser_quotas()
    r = client.post("/traduction", json={"cible": "en", "textes": ["Experts en intelligence économique."]})
    assert r.json()["traductions"] == [
        "Experts in competitive intelligence. Competitive intelligence matters. COMPETITIVE INTELLIGENCE."
    ]


def test_glossaire_deepl_cree_puis_reutilise(monkeypatch):
    appels = []

    def appel(methode, url, corps, entetes):
        appels.append((methode, url, corps))
        if methode == "GET":
            return {"glossaries": [{"glossary_id": "ancien", "name": "ie237-fr-en-000000000000"}]}
        if url.endswith("/v2/glossaries"):
            return {"glossary_id": "g-1"}
        if url.endswith("/v2/translate"):
            return {"translations": [{"text": "ok"} for _ in corps["text"]]}
        return {}

    monkeypatch.setattr(config, "DEEPL_API_KEY", "abc:fx")
    monkeypatch.setattr(traduction_service, "GLOSSAIRE", {"en": {"intelligence économique": "competitive intelligence"}})
    monkeypatch.setattr(traduction_service, "_appel", appel)
    monkeypatch.setattr(traduction_service, "_glossaires_deepl", {})
    traduction_service._traduire_externe(["a"], "en")
    traduction_service._traduire_externe(["b"], "en")

    creation = [c for c in appels if c[0] == "POST" and c[1].endswith("/v2/glossaries")]
    assert len(creation) == 1  # créé une seule fois
    assert creation[0][2]["entries"] == "intelligence économique\tcompetitive intelligence"
    assert ("DELETE", "https://api-free.deepl.com/v2/glossaries/ancien", None) in appels  # ancienne version supprimée
    traductions = [c[2] for c in appels if c[1].endswith("/v2/translate")]
    assert all(t["glossary_id"] == "g-1" for t in traductions)


def test_appel_deepl(monkeypatch):
    """Vérifie la requête envoyée à DeepL (hôte gratuit, en-tête, langues)."""
    appels = []

    def post_json(url, corps, entetes):
        appels.append((url, corps, entetes))
        return {"translations": [{"text": t.upper()} for t in corps["text"]]}

    monkeypatch.setattr(config, "DEEPL_API_KEY", "abc:fx")
    monkeypatch.setattr(traduction_service, "_post_json", post_json)
    monkeypatch.setattr(traduction_service, "_glossaire_deepl", lambda *a: None)
    assert traduction_service._traduire_externe(["bonjour"] * 60, "en") == ["BONJOUR"] * 60
    assert len(appels) == 2  # lots de 50
    url, corps, entetes = appels[0]
    assert url == "https://api-free.deepl.com/v2/translate"
    assert corps["source_lang"] == "FR" and corps["target_lang"] == "EN-GB"
    assert entetes["Authorization"] == "DeepL-Auth-Key abc:fx"
