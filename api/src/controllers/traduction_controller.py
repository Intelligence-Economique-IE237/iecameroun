"""Controllers : reçoivent la requête HTTP, appellent le service, renvoient la réponse."""
from fastapi import Request

from src.core import config
from src.core.dependencies import SessionDep
from src.schemas.traduction import DemandeTraduction
from src.services import traduction_service


def _ip(request: Request) -> str:
    # Derrière le proxy (Coolify/Traefik), l'adresse réelle est la première de X-Forwarded-For
    transmise = request.headers.get("x-forwarded-for", "")
    if transmise:
        return transmise.split(",")[0].strip()
    return request.client.host if request.client else ""


def langues():
    return {
        "source": traduction_service.LANGUE_SOURCE,
        "cibles": config.TRADUCTION_LANGUES,
        "active": traduction_service.service_actif() is not None,
        "version": traduction_service.version(),
    }


def traduire(donnees: DemandeTraduction, request: Request, session: SessionDep):
    traductions = traduction_service.traduire(session, donnees.textes, donnees.cible, _ip(request))
    return {"cible": donnees.cible.lower(), "traductions": traductions}
