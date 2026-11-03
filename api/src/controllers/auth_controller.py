"""Controllers : reçoivent la requête HTTP, appellent le service, renvoient la réponse."""
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm

from src.core.dependencies import SessionDep, UtilisateurDep
from src.schemas.auth import Jeton
from src.services import auth_service


def login(session: SessionDep, formulaire: OAuth2PasswordRequestForm = Depends()) -> Jeton:
    # Le champ "username" du formulaire contient l'email
    jeton = auth_service.connecter(session, formulaire.username, formulaire.password)
    return Jeton(access_token=jeton)


def moi(utilisateur: UtilisateurDep):
    # L'admin s'en sert pour afficher ou masquer les boutons selon le rôle
    return utilisateur
