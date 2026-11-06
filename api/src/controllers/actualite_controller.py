"""Controllers : reçoivent la requête HTTP, appellent le service, renvoient la réponse."""
import re

from fastapi import Request, UploadFile

from src.core.dependencies import SessionDep, UtilisateurDep
from src.schemas.actualite import ActualiteCreation, ActualiteModification, ChangementStatut
from src.services import actualite_service

# Robots d'indexation et aperçus de liens (WhatsApp, LinkedIn…) : ne comptent pas comme des lectures
ROBOT = re.compile(r"bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse", re.I)


# ---------- Public (site) ----------

def lister_publiees(session: SessionDep):
    return actualite_service.lister_publiees(session)


def lire_publiee(slug: str, session: SessionDep):
    return actualite_service.trouver_publiee(session, slug)


def compter_lecture(slug: str, request: Request, session: SessionDep):
    if not ROBOT.search(request.headers.get("user-agent", "")):
        actualite_service.compter_lecture(session, slug)


# ---------- Admin ----------

def lister_toutes(session: SessionDep):
    return actualite_service.lister_toutes(session)


def lire(id_: int, session: SessionDep):
    return actualite_service.trouver(session, id_)


def creer(donnees: ActualiteCreation, session: SessionDep, utilisateur: UtilisateurDep):
    # L'auteur est le compte connecté qui crée l'article
    return actualite_service.creer(session, donnees, utilisateur)


def modifier(id_: int, donnees: ActualiteModification, session: SessionDep, utilisateur: UtilisateurDep):
    return actualite_service.modifier(session, id_, donnees, utilisateur)


def changer_statut(id_: int, demande: ChangementStatut, session: SessionDep, utilisateur: UtilisateurDep):
    return actualite_service.changer_statut(session, id_, demande, utilisateur)


def supprimer(id_: int, session: SessionDep):
    actualite_service.supprimer(session, id_)


async def envoyer_image(id_: int, fichier: UploadFile, session: SessionDep, utilisateur: UtilisateurDep):
    contenu = await fichier.read()
    return actualite_service.changer_image(session, id_, contenu, fichier.filename or "", utilisateur)


def statistiques(session: SessionDep):
    return actualite_service.statistiques(session)


def lectures_article(id_: int, session: SessionDep):
    return actualite_service.lectures_article(session, id_)
