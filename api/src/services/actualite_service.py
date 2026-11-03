"""Logique métier des actualités : tout ce qui touche à la base passe par ici."""
import re
import unicodedata

from sqlmodel import Session, select

from src.core.erreurs import Introuvable
from src.models.actualite import Actualite, maintenant
from src.schemas.actualite import ActualiteCreation, ActualiteModification
from src.services import fichier_service


def _slugifier(texte: str) -> str:
    # "Conférence à l'ENAM" → "conference-a-l-enam"
    texte = unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", texte.lower()).strip("-")[:200] or "actualite"


def _slug_unique(session: Session, titre: str, id_actuel: int | None = None) -> str:
    base = _slugifier(titre)
    slug, n = base, 2
    while True:
        existant = session.exec(select(Actualite).where(Actualite.slug == slug)).first()
        if not existant or existant.id == id_actuel:
            return slug
        slug, n = f"{base}-{n}", n + 1


def _enregistrer(session: Session, actu: Actualite) -> Actualite:
    session.add(actu)
    session.commit()
    session.refresh(actu)
    return actu


# ---------- Lecture ----------

def lister_publiees(session: Session) -> list[Actualite]:
    requete = (
        select(Actualite)
        .where(Actualite.publie == True)  # noqa: E712
        .order_by(Actualite.publie_le.desc())
    )
    return list(session.exec(requete).all())


def trouver_publiee(session: Session, slug: str) -> Actualite:
    actu = session.exec(
        select(Actualite).where(Actualite.slug == slug, Actualite.publie == True)  # noqa: E712
    ).first()
    if not actu:
        raise Introuvable("Actualité introuvable")
    return actu


def lister_toutes(session: Session) -> list[Actualite]:
    return list(session.exec(select(Actualite).order_by(Actualite.cree_le.desc())).all())


def trouver(session: Session, id_: int) -> Actualite:
    actu = session.get(Actualite, id_)
    if not actu:
        raise Introuvable("Actualité introuvable")
    return actu


# ---------- Écriture ----------

def creer(session: Session, donnees: ActualiteCreation) -> Actualite:
    actu = Actualite(**donnees.model_dump(), slug=_slug_unique(session, donnees.titre))
    if actu.publie:
        actu.publie_le = maintenant()
    return _enregistrer(session, actu)


def modifier(session: Session, id_: int, donnees: ActualiteModification) -> Actualite:
    actu = trouver(session, id_)
    changements = donnees.model_dump(exclude_unset=True)

    if "titre" in changements:
        actu.slug = _slug_unique(session, changements["titre"], actu.id)
    # La date de publication est fixée la première fois qu'on publie
    if changements.get("publie") and not actu.publie_le:
        actu.publie_le = maintenant()

    for champ, valeur in changements.items():
        setattr(actu, champ, valeur)
    actu.modifie_le = maintenant()
    return _enregistrer(session, actu)


def supprimer(session: Session, id_: int) -> None:
    actu = trouver(session, id_)
    fichier_service.supprimer_fichier(actu.image)
    session.delete(actu)
    session.commit()


def changer_image(session: Session, id_: int, contenu: bytes, nom_fichier: str) -> Actualite:
    actu = trouver(session, id_)
    nouveau_chemin = fichier_service.enregistrer_image(contenu, nom_fichier, "actualites")
    fichier_service.supprimer_fichier(actu.image)  # remplace l'ancienne image
    actu.image = nouveau_chemin
    actu.modifie_le = maintenant()
    return _enregistrer(session, actu)
