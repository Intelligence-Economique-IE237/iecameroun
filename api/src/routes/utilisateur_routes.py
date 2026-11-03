"""Routes : associent chaque URL à son controller. Tout est réservé au rôle Admin."""
from fastapi import APIRouter

from src.controllers import utilisateur_controller as c
from src.core.dependencies import admin_seulement
from src.schemas.utilisateur import UtilisateurLecture

router = APIRouter(
    prefix="/admin/utilisateurs",
    tags=["Utilisateurs (Admin)"],
    dependencies=[admin_seulement],
)
router.add_api_route("", c.lister, methods=["GET"], response_model=list[UtilisateurLecture])
router.add_api_route("", c.creer, methods=["POST"], response_model=UtilisateurLecture, status_code=201)
router.add_api_route("/{id_}", c.lire, methods=["GET"], response_model=UtilisateurLecture)
router.add_api_route("/{id_}", c.modifier, methods=["PATCH"], response_model=UtilisateurLecture)
router.add_api_route("/{id_}", c.supprimer, methods=["DELETE"], status_code=204)
