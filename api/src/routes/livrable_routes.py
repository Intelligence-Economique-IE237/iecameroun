"""Routes : associent chaque URL à son controller."""
from fastapi import APIRouter

from src.controllers import livrable_controller as c
from src.core.dependencies import admin_seulement, connecte
from src.schemas.livrable import LivrableLecture

# Lue par le site public (section Livrables)
public = APIRouter(prefix="/livrables", tags=["Livrables (public)"])
public.add_api_route("", c.lister_publies, methods=["GET"], response_model=list[LivrableLecture])

# Panneau admin : Admin et Éditeur (la suppression est réservée à l'Admin)
admin = APIRouter(prefix="/admin/livrables", tags=["Livrables (admin)"], dependencies=[connecte])
admin.add_api_route("", c.lister_tous, methods=["GET"], response_model=list[LivrableLecture])
admin.add_api_route("", c.creer, methods=["POST"], response_model=LivrableLecture, status_code=201)
admin.add_api_route("/{id_}", c.lire, methods=["GET"], response_model=LivrableLecture)
admin.add_api_route("/{id_}", c.modifier, methods=["PATCH"], response_model=LivrableLecture)
admin.add_api_route("/{id_}/fichier", c.envoyer_fichier, methods=["POST"], response_model=LivrableLecture)
admin.add_api_route(
    "/{id_}", c.supprimer, methods=["DELETE"], status_code=204, dependencies=[admin_seulement]
)
