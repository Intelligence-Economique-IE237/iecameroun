"""Gestion des comptes du panneau admin (réservée au rôle Admin)."""
from sqlalchemy import func
from sqlmodel import Session, select

from src.core.erreurs import DonneesInvalides, Introuvable
from src.core.security import hacher_mot_de_passe
from src.models import Role, Utilisateur
from src.schemas.utilisateur import UtilisateurCreation, UtilisateurModification

LONGUEUR_MIN_MOT_DE_PASSE = 12


def _par_email(session: Session, email: str) -> Utilisateur | None:
    return session.exec(select(Utilisateur).where(Utilisateur.email == email.lower())).first()


def _nombre_admins(session: Session) -> int:
    return session.exec(select(func.count()).where(Utilisateur.role == Role.ADMIN.value)).one()


def _enregistrer(session: Session, utilisateur: Utilisateur) -> Utilisateur:
    session.add(utilisateur)
    session.commit()
    session.refresh(utilisateur)
    return utilisateur


def lister(session: Session) -> list[Utilisateur]:
    return list(session.exec(select(Utilisateur).order_by(Utilisateur.email)).all())


def trouver(session: Session, id_: int) -> Utilisateur:
    utilisateur = session.get(Utilisateur, id_)
    if not utilisateur:
        raise Introuvable("Utilisateur introuvable")
    return utilisateur


def creer(session: Session, donnees: UtilisateurCreation) -> Utilisateur:
    if _par_email(session, donnees.email):
        raise DonneesInvalides("Un compte existe déjà avec cet email")
    utilisateur = Utilisateur(
        email=donnees.email.lower(),
        nom=donnees.nom,
        role=donnees.role.value,
        mot_de_passe_hash=hacher_mot_de_passe(donnees.mot_de_passe),
    )
    return _enregistrer(session, utilisateur)


def modifier(session: Session, id_: int, donnees: UtilisateurModification) -> Utilisateur:
    utilisateur = trouver(session, id_)
    changements = donnees.model_dump(exclude_unset=True)

    nouveau_role = changements.get("role")
    if (
        nouveau_role
        and nouveau_role != Role.ADMIN
        and utilisateur.role == Role.ADMIN.value
        and _nombre_admins(session) == 1
    ):
        raise DonneesInvalides("Impossible de retirer le rôle du dernier Admin")

    if "nom" in changements:
        utilisateur.nom = changements["nom"]
    if nouveau_role:
        utilisateur.role = nouveau_role.value
    if changements.get("mot_de_passe"):
        utilisateur.mot_de_passe_hash = hacher_mot_de_passe(changements["mot_de_passe"])
    return _enregistrer(session, utilisateur)


def supprimer(session: Session, id_: int, demandeur: Utilisateur) -> None:
    utilisateur = trouver(session, id_)
    if utilisateur.id == demandeur.id:
        raise DonneesInvalides("Vous ne pouvez pas supprimer votre propre compte")
    session.delete(utilisateur)
    session.commit()


def enregistrer_ou_reinitialiser(
    session: Session, email: str, mot_de_passe: str, nom: str = "", role: Role = Role.ADMIN
) -> Utilisateur:
    """Utilisé par scripts/creer_admin.py : crée le compte, ou change son mot de passe et son rôle."""
    if len(mot_de_passe) < LONGUEUR_MIN_MOT_DE_PASSE:
        raise DonneesInvalides(f"Le mot de passe doit faire au moins {LONGUEUR_MIN_MOT_DE_PASSE} caractères.")
    utilisateur = _par_email(session, email) or Utilisateur(email=email.lower())
    utilisateur.nom = nom or utilisateur.nom
    utilisateur.role = role.value
    utilisateur.mot_de_passe_hash = hacher_mot_de_passe(mot_de_passe)
    return _enregistrer(session, utilisateur)
