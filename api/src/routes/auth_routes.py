"""Routes : associent chaque URL à son controller."""
from fastapi import APIRouter

from src.controllers import auth_controller
from src.schemas.auth import Jeton
from src.schemas.utilisateur import UtilisateurLecture

router = APIRouter(prefix="/auth", tags=["Connexion"])

router.add_api_route("/login", auth_controller.login, methods=["POST"], response_model=Jeton)
router.add_api_route("/moi", auth_controller.moi, methods=["GET"], response_model=UtilisateurLecture)
