"""Controllers : reçoivent la requête HTTP, appellent le service, renvoient la réponse."""
from fastapi import UploadFile

from src.core.dependencies import SessionDep
from src.schemas.evenement import EvenementCreation, EvenementModification, PhotoModification
from src.services import evenement_service as s


# ---------- Public (site) ----------

def lister_publies(session: SessionDep):
    return [s.lecture(session, e) for e in s.lister_publies(session)]


def lire_publie(slug: str, session: SessionDep):
    return s.lecture(session, s.trouver_publie(session, slug))


# ---------- Admin ----------

def lister_tous(session: SessionDep):
    return [s.lecture(session, e) for e in s.lister_tous(session)]


def lire(id_: int, session: SessionDep):
    return s.lecture(session, s.trouver(session, id_))


def creer(donnees: EvenementCreation, session: SessionDep):
    return s.lecture(session, s.creer(session, donnees))


def modifier(id_: int, donnees: EvenementModification, session: SessionDep):
    return s.lecture(session, s.modifier(session, id_, donnees))


def supprimer(id_: int, session: SessionDep):
    s.supprimer(session, id_)


async def envoyer_couverture(id_: int, fichier: UploadFile, session: SessionDep):
    contenu = await fichier.read()
    return s.lecture(session, s.changer_couverture(session, id_, contenu, fichier.filename or ""))


async def envoyer_document(id_: int, fichier: UploadFile, session: SessionDep):
    contenu = await fichier.read()
    return s.lecture(session, s.changer_document(session, id_, contenu, fichier.filename or ""))


def retirer_document(id_: int, session: SessionDep):
    return s.lecture(session, s.retirer_document(session, id_))


async def ajouter_photo(id_: int, fichier: UploadFile, session: SessionDep):
    contenu = await fichier.read()
    return s.lecture(session, s.ajouter_photo(session, id_, contenu, fichier.filename or ""))


def legender_photo(id_: int, photo_id: int, donnees: PhotoModification, session: SessionDep):
    return s.lecture(session, s.legender_photo(session, id_, photo_id, donnees.legende))


def supprimer_photo(id_: int, photo_id: int, session: SessionDep):
    return s.lecture(session, s.supprimer_photo(session, id_, photo_id))
