"""Routes : associent chaque URL à son controller."""
from fastapi import APIRouter

from src.controllers import evenement_controller as c
from src.core.dependencies import admin_seulement, connecte, redaction
from src.schemas.evenement import EvenementLecture

L = EvenementLecture

# Lues par le site public
public = APIRouter(prefix="/evenements", tags=["Événements (public)"])
public.add_api_route("", c.lister_publies, methods=["GET"], response_model=list[L])
public.add_api_route("/{slug}", c.lire_publie, methods=["GET"], response_model=L)

# Panneau admin : gérés par l'Admin et l'Éditeur, consultables par l'Analyste
# (la suppression d'un événement est réservée à l'Admin)
admin = APIRouter(prefix="/admin/evenements", tags=["Événements (admin)"], dependencies=[connecte])
admin.add_api_route("", c.lister_tous, methods=["GET"], response_model=list[L])
admin.add_api_route("", c.creer, methods=["POST"], response_model=L, status_code=201, dependencies=[redaction])
admin.add_api_route("/{id_}", c.lire, methods=["GET"], response_model=L)
admin.add_api_route("/{id_}", c.modifier, methods=["PATCH"], response_model=L, dependencies=[redaction])
admin.add_api_route("/{id_}", c.supprimer, methods=["DELETE"], status_code=204, dependencies=[admin_seulement])
admin.add_api_route("/{id_}/couverture", c.envoyer_couverture, methods=["POST"], response_model=L, dependencies=[redaction])
admin.add_api_route("/{id_}/document", c.envoyer_document, methods=["POST"], response_model=L, dependencies=[redaction])
admin.add_api_route("/{id_}/document", c.retirer_document, methods=["DELETE"], response_model=L, dependencies=[redaction])
admin.add_api_route("/{id_}/photos", c.ajouter_photo, methods=["POST"], response_model=L, dependencies=[redaction])
admin.add_api_route("/{id_}/photos/{photo_id}", c.legender_photo, methods=["PATCH"], response_model=L, dependencies=[redaction])
admin.add_api_route("/{id_}/photos/{photo_id}", c.supprimer_photo, methods=["DELETE"], response_model=L, dependencies=[redaction])
