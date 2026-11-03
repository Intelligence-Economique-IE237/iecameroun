"""Logique métier des livrables (documents PDF)."""
from sqlmodel import Session, select

from src.core.erreurs import DonneesInvalides, Introuvable
from src.models.actualite import maintenant
from src.models.livrable import Livrable
from src.schemas.livrable import LivrableCreation, LivrableModification
from src.services import fichier_service


def _enregistrer(session: Session, livrable: Livrable) -> Livrable:
    session.add(livrable)
    session.commit()
    session.refresh(livrable)
    return livrable


# ---------- Lecture ----------

def lister_publies(session: Session) -> list[Livrable]:
    requete = (
        select(Livrable)
        .where(Livrable.publie == True, Livrable.fichier != None)  # noqa: E711, E712
        .order_by(Livrable.publie_le.desc())
    )
    return list(session.exec(requete).all())


def lister_tous(session: Session) -> list[Livrable]:
    return list(session.exec(select(Livrable).order_by(Livrable.cree_le.desc())).all())


def trouver(session: Session, id_: int) -> Livrable:
    livrable = session.get(Livrable, id_)
    if not livrable:
        raise Introuvable("Livrable introuvable")
    return livrable


# ---------- Écriture ----------

def creer(session: Session, donnees: LivrableCreation) -> Livrable:
    # Toujours créé en brouillon : il n'a pas encore de PDF
    return _enregistrer(session, Livrable(**donnees.model_dump()))


def modifier(session: Session, id_: int, donnees: LivrableModification) -> Livrable:
    livrable = trouver(session, id_)
    changements = donnees.model_dump(exclude_unset=True)

    if changements.get("publie"):
        if not livrable.fichier:
            raise DonneesInvalides("Envoyer le PDF avant de publier le livrable")
        if not livrable.publie_le:
            livrable.publie_le = maintenant()

    for champ, valeur in changements.items():
        setattr(livrable, champ, valeur)
    livrable.modifie_le = maintenant()
    return _enregistrer(session, livrable)


def supprimer(session: Session, id_: int) -> None:
    livrable = trouver(session, id_)
    fichier_service.supprimer_fichier(livrable.fichier)
    session.delete(livrable)
    session.commit()


def changer_fichier(session: Session, id_: int, contenu: bytes, nom_fichier: str) -> Livrable:
    livrable = trouver(session, id_)
    nouveau_chemin = fichier_service.enregistrer_pdf(contenu, nom_fichier, "livrables")
    fichier_service.supprimer_fichier(livrable.fichier)  # remplace l'ancien PDF
    livrable.fichier = nouveau_chemin
    livrable.modifie_le = maintenant()
    return _enregistrer(session, livrable)
