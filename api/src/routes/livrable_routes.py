"""Routes : associent chaque URL à son controller."""
from fastapi import APIRouter

from src.controllers import livrable_controller as c
from src.core.dependencies import admin_seulement, analyse, connecte
from src.schemas.livrable import LivrableLecture

# Lue par le site public (section Livrables)
public = APIRouter(prefix="/livrables", tags=["Livrables (public)"])
public.add_api_route("", c.lister_publies, methods=["GET"], response_model=list[LivrableLecture])

# Panneau admin : gérés par l'Admin et l'Analyste, consultables par tous
# (la suppression est réservée à l'Admin)
L = LivrableLecture
admin = APIRouter(prefix="/admin/livrables", tags=["Livrables (admin)"], dependencies=[connecte])
admin.add_api_route("", c.lister_tous, methods=["GET"], response_model=list[L])
admin.add_api_route("", c.creer, methods=["POST"], response_model=L, status_code=201, dependencies=[analyse])
admin.add_api_route("/{id_}", c.lire, methods=["GET"], response_model=L)
admin.add_api_route("/{id_}", c.modifier, methods=["PATCH"], response_model=L, dependencies=[analyse])
admin.add_api_route("/{id_}/fichier", c.envoyer_fichier, methods=["POST"], response_model=L, dependencies=[analyse])
admin.add_api_route(
    "/{id_}", c.supprimer, methods=["DELETE"], status_code=204, dependencies=[admin_seulement]
)
