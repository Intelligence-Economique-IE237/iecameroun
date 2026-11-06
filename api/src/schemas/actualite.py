"""Formats des données échangées avec le site et l'admin (ce qui entre et ce qui sort)."""
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from src.models.actualite import Statut


class ActualiteCreation(BaseModel):
    # Un article est toujours créé en brouillon : la publication passe par le circuit de validation
    titre: str = Field(min_length=1, max_length=200)
    resume: str = Field(default="", max_length=500)
    contenu: str = ""


class ActualiteModification(BaseModel):
    # Tous les champs sont facultatifs : on n'envoie que ce qui change
    titre: Optional[str] = Field(default=None, min_length=1, max_length=200)
    resume: Optional[str] = Field(default=None, max_length=500)
    contenu: Optional[str] = None


# soumettre (Éditeur) → valider ou renvoyer (Analyste) → publier / retirer (Éditeur)
Action = Literal["soumettre", "valider", "renvoyer", "publier", "retirer"]


class ChangementStatut(BaseModel):
    action: Action
    commentaire: str = Field(default="", max_length=2000)  # obligatoire pour « renvoyer »


class ActualitePublique(BaseModel):
    """Ce que voit le site : jamais les commentaires internes de validation."""

    id: int
    titre: str
    slug: str
    resume: str
    contenu: str
    image: Optional[str]
    auteur: str
    publie: bool
    publie_le: Optional[datetime]
    cree_le: datetime
    modifie_le: datetime


class ActualiteLecture(ActualitePublique):
    """Ce que voit le panneau admin."""

    statut: Statut
    commentaire: str
    soumis_le: Optional[datetime]
    valide_par: str
    valide_le: Optional[datetime]
    lectures: int


# ---------- Statistiques de lecture ----------

class LecturesJour(BaseModel):
    jour: date
    nombre: int


class ArticleLu(BaseModel):
    id: int
    titre: str
    slug: str
    lectures: int


class StatistiquesLectures(BaseModel):
    total: int
    sur_7_jours: int
    sur_30_jours: int
    par_jour: list[LecturesJour]  # les 30 derniers jours, jours sans lecture compris
    plus_lus: list[ArticleLu]


class LecturesArticle(BaseModel):
    total: int
    sur_7_jours: int
    sur_30_jours: int
    par_jour: list[LecturesJour]
