"""Formats des données échangées avec le site et l'admin (ce qui entre et ce qui sort)."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ActualiteCreation(BaseModel):
    titre: str = Field(min_length=1, max_length=200)
    resume: str = Field(default="", max_length=500)
    contenu: str = ""
    publie: bool = False


class ActualiteModification(BaseModel):
    # Tous les champs sont facultatifs : on n'envoie que ce qui change
    titre: Optional[str] = Field(default=None, min_length=1, max_length=200)
    resume: Optional[str] = Field(default=None, max_length=500)
    contenu: Optional[str] = None
    publie: Optional[bool] = None


class ActualiteLecture(BaseModel):
    id: int
    titre: str
    slug: str
    resume: str
    contenu: str
    image: Optional[str]
    publie: bool
    publie_le: Optional[datetime]
    cree_le: datetime
    modifie_le: datetime
