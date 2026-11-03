"""Routes : associent chaque URL à son controller."""
from fastapi import APIRouter

from src.controllers import actualite_controller as c
from src.core.dependencies import admin_seulement, connecte
from src.schemas.actualite import ActualiteLecture

# Lues par le site public
public = APIRouter(prefix="/actualites", tags=["Actualités (public)"])
public.add_api_route("", c.lister_publiees, methods=["GET"], response_model=list[ActualiteLecture])
public.add_api_route("/{slug}", c.lire_publiee, methods=["GET"], response_model=ActualiteLecture)

# Panneau admin : Admin et Éditeur (la suppression est réservée à l'Admin)
admin = APIRouter(prefix="/admin/actualites", tags=["Actualités (admin)"], dependencies=[connecte])
admin.add_api_route("", c.lister_toutes, methods=["GET"], response_model=list[ActualiteLecture])
admin.add_api_route("", c.creer, methods=["POST"], response_model=ActualiteLecture, status_code=201)
admin.add_api_route("/{id_}", c.lire, methods=["GET"], response_model=ActualiteLecture)
admin.add_api_route("/{id_}", c.modifier, methods=["PATCH"], response_model=ActualiteLecture)
admin.add_api_route("/{id_}/image", c.envoyer_image, methods=["POST"], response_model=ActualiteLecture)
admin.add_api_route(
    "/{id_}", c.supprimer, methods=["DELETE"], status_code=204, dependencies=[admin_seulement]
)
