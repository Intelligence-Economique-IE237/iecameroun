"""Routes : associent chaque URL à son controller."""
from fastapi import APIRouter

from src.controllers import traduction_controller as c
from src.schemas.traduction import Langues, ReponseTraduction

# Utilisée par le site public ET par le panneau admin (sans connexion)
router = APIRouter(prefix="/traduction", tags=["Traduction automatique"])
router.add_api_route("/langues", c.langues, methods=["GET"], response_model=Langues)
router.add_api_route("", c.traduire, methods=["POST"], response_model=ReponseTraduction)
