"""Controllers : reçoivent la requête HTTP, appellent le service, renvoient la réponse."""
from fastapi import UploadFile

from src.core.dependencies import SessionDep
from src.schemas.livrable import LivrableCreation, LivrableModification
from src.services import livrable_service


# ---------- Public (site) ----------

def lister_publies(session: SessionDep):
    return livrable_service.lister_publies(session)


# ---------- Admin ----------

def lister_tous(session: SessionDep):
    return livrable_service.lister_tous(session)


def lire(id_: int, session: SessionDep):
    return livrable_service.trouver(session, id_)


def creer(donnees: LivrableCreation, session: SessionDep):
    return livrable_service.creer(session, donnees)


def modifier(id_: int, donnees: LivrableModification, session: SessionDep):
    return livrable_service.modifier(session, id_, donnees)


def supprimer(id_: int, session: SessionDep):
    livrable_service.supprimer(session, id_)


async def envoyer_fichier(id_: int, fichier: UploadFile, session: SessionDep):
    contenu = await fichier.read()
    return livrable_service.changer_fichier(session, id_, contenu, fichier.filename or "")
