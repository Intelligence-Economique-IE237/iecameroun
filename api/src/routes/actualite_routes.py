"""Routes : associent chaque URL à son controller."""
from fastapi import APIRouter

from src.controllers import actualite_controller as c
from src.core.dependencies import admin_seulement, connecte, redaction
from src.schemas.actualite import ActualiteLecture, ActualitePublique, LecturesArticle, StatistiquesLectures

L = ActualiteLecture

# Lues par le site public (sans les commentaires internes de validation)
public = APIRouter(prefix="/actualites", tags=["Actualités (public)"])
public.add_api_route("", c.lister_publiees, methods=["GET"], response_model=list[ActualitePublique])
public.add_api_route("/{slug}", c.lire_publiee, methods=["GET"], response_model=ActualitePublique)
# Le site appelle cette route une fois par visite d'un article
public.add_api_route("/{slug}/lecture", c.compter_lecture, methods=["POST"], status_code=204)

# Panneau admin. Les droits fins (qui modifie quoi, à quelle étape) sont vérifiés dans le service.
admin = APIRouter(prefix="/admin/actualites", tags=["Actualités (admin)"], dependencies=[connecte])
admin.add_api_route("", c.lister_toutes, methods=["GET"], response_model=list[L])
admin.add_api_route("", c.creer, methods=["POST"], response_model=L, status_code=201, dependencies=[redaction])
admin.add_api_route("/statistiques", c.statistiques, methods=["GET"], response_model=StatistiquesLectures)
admin.add_api_route("/{id_}", c.lire, methods=["GET"], response_model=L)
admin.add_api_route("/{id_}", c.modifier, methods=["PATCH"], response_model=L)
admin.add_api_route("/{id_}/statut", c.changer_statut, methods=["POST"], response_model=L)
admin.add_api_route("/{id_}/image", c.envoyer_image, methods=["POST"], response_model=L)
admin.add_api_route("/{id_}/lectures", c.lectures_article, methods=["GET"], response_model=LecturesArticle)
admin.add_api_route("/{id_}", c.supprimer, methods=["DELETE"], status_code=204, dependencies=[admin_seulement])
