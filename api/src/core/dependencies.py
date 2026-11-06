"""Dépendances communes injectées dans les controllers et les routes."""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from src.core.database import get_session
from src.core.security import lire_jeton
from src.models import Role, Utilisateur

SessionDep = Annotated[Session, Depends(get_session)]

oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/login")


def utilisateur_connecte(session: SessionDep, jeton: str = Depends(oauth2)) -> Utilisateur:
    # Le rôle est relu en base à chaque requête : un changement de rôle s'applique tout de suite
    utilisateur_id = lire_jeton(jeton)
    utilisateur = session.get(Utilisateur, utilisateur_id) if utilisateur_id else None
    if not utilisateur:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Session invalide ou expirée",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return utilisateur


def exiger_role(*roles: Role):
    """Autorise seulement les rôles indiqués. Ex. : Depends(exiger_role(Role.ADMIN))"""
    autorises = {r.value for r in roles}

    def verifier(utilisateur: Utilisateur = Depends(utilisateur_connecte)) -> Utilisateur:
        if utilisateur.role not in autorises:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Action non autorisée pour votre rôle")
        return utilisateur

    return verifier


UtilisateurDep = Annotated[Utilisateur, Depends(utilisateur_connecte)]
AdminDep = Annotated[Utilisateur, Depends(exiger_role(Role.ADMIN))]

# Raccourcis pour les routes
connecte = Depends(utilisateur_connecte)                             # tout compte connecté
admin_seulement = Depends(exiger_role(Role.ADMIN))                   # Admin uniquement
redaction = Depends(exiger_role(Role.ADMIN, Role.EDITEUR))           # rédiger actualités et événements
analyse = Depends(exiger_role(Role.ADMIN, Role.ANALYSTE))            # gérer les livrables
