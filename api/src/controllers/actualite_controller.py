"""Controllers : reçoivent la requête HTTP, appellent le service, renvoient la réponse."""
from fastapi import UploadFile

from src.core.dependencies import SessionDep
from src.schemas.actualite import ActualiteCreation, ActualiteModification
from src.services import actualite_service


# ---------- Public (site) ----------

def lister_publiees(session: SessionDep):
    return actualite_service.lister_publiees(session)


def lire_publiee(slug: str, session: SessionDep):
    return actualite_service.trouver_publiee(session, slug)


# ---------- Admin ----------

def lister_toutes(session: SessionDep):
    return actualite_service.lister_toutes(session)


def lire(id_: int, session: SessionDep):
    return actualite_service.trouver(session, id_)


def creer(donnees: ActualiteCreation, session: SessionDep):
    return actualite_service.creer(session, donnees)


def modifier(id_: int, donnees: ActualiteModification, session: SessionDep):
    return actualite_service.modifier(session, id_, donnees)


def supprimer(id_: int, session: SessionDep):
    actualite_service.supprimer(session, id_)


async def envoyer_image(id_: int, fichier: UploadFile, session: SessionDep):
    contenu = await fichier.read()
    return actualite_service.changer_image(session, id_, contenu, fichier.filename or "")
