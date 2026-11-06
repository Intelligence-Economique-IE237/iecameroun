"""Formats des données échangées pour les événements."""
from datetime import date as Date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator

# module, exercice pratique, temps officiel, pause, synthèse ; « intertitre » sépare la journée en parties
Nature = Literal["module", "exercice", "officiel", "pause", "synthese", "intertitre"]


class Info(BaseModel):
    libelle: str = Field(min_length=1, max_length=60)
    valeur: str = Field(min_length=1, max_length=200)


class LigneProgramme(BaseModel):
    horaire: str = Field(default="", max_length=40)      # « 08h30 – 10h00 »
    activite: str = Field(min_length=1, max_length=500)
    intervenant: str = Field(default="", max_length=200)
    nature: Nature = "module"


class JourProgramme(BaseModel):
    date: Optional[Date] = None
    titre: str = Field(default="", max_length=200)      # « Session d'ouverture »
    lignes: list[LigneProgramme] = Field(default_factory=list, max_length=60)


class _Champs(BaseModel):
    sigle: str = Field(min_length=1, max_length=80)
    type: str = Field(default="Formation", max_length=60)
    theme: str = Field(default="", max_length=120)
    titre: str = Field(min_length=1, max_length=300)
    resume: str = Field(default="", max_length=500)
    description: str = ""
    debut: Date
    fin: Date
    lieu: str = Field(default="", max_length=200)
    infos: list[Info] = Field(default_factory=list, max_length=8)
    programme: list[JourProgramme] = Field(default_factory=list, max_length=31)
    document_libelle: str = Field(default="", max_length=120)
    publie: bool = False


class EvenementCreation(_Champs):
    @model_validator(mode="after")
    def _dates(self):
        if self.fin < self.debut:
            raise ValueError("La date de fin doit être après la date de début")
        return self


class EvenementModification(BaseModel):
    # Tous les champs sont facultatifs : on n'envoie que ce qui change
    sigle: Optional[str] = Field(default=None, min_length=1, max_length=80)
    type: Optional[str] = Field(default=None, max_length=60)
    theme: Optional[str] = Field(default=None, max_length=120)
    titre: Optional[str] = Field(default=None, min_length=1, max_length=300)
    resume: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = None
    debut: Optional[Date] = None
    fin: Optional[Date] = None
    lieu: Optional[str] = Field(default=None, max_length=200)
    infos: Optional[list[Info]] = Field(default=None, max_length=8)
    programme: Optional[list[JourProgramme]] = Field(default=None, max_length=31)
    document_libelle: Optional[str] = Field(default=None, max_length=120)
    publie: Optional[bool] = None


class PhotoLecture(BaseModel):
    id: int
    chemin: str
    legende: str
    ordre: int


class PhotoModification(BaseModel):
    legende: str = Field(default="", max_length=200)


class EvenementLecture(_Champs):
    id: int
    slug: str
    couverture: Optional[str]
    document: Optional[str]
    photos: list[PhotoLecture] = []
    publie_le: Optional[datetime]
    cree_le: datetime
    modifie_le: datetime
