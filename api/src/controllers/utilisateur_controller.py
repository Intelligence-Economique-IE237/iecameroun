"""Controllers : reçoivent la requête HTTP, appellent le service, renvoient la réponse."""
from src.core.dependencies import AdminDep, SessionDep
from src.schemas.utilisateur import UtilisateurCreation, UtilisateurModification
from src.services import utilisateur_service


def lister(session: SessionDep):
    return utilisateur_service.lister(session)


def lire(id_: int, session: SessionDep):
    return utilisateur_service.trouver(session, id_)


def creer(donnees: UtilisateurCreation, session: SessionDep):
    return utilisateur_service.creer(session, donnees)


def modifier(id_: int, donnees: UtilisateurModification, session: SessionDep):
    return utilisateur_service.modifier(session, id_, donnees)


def supprimer(id_: int, session: SessionDep, admin: AdminDep):
    utilisateur_service.supprimer(session, id_, demandeur=admin)
