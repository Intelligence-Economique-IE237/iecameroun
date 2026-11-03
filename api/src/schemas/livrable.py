"""Formats des données échangées avec le site et l'admin pour les livrables."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class LivrableCreation(BaseModel):
    titre: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=500)
    etiquette: str = Field(default="Étude", min_length=1, max_length=50)
    # Pas de "publie" ici : on publie après avoir envoyé le PDF


class LivrableModification(BaseModel):
    # Tous les champs sont facultatifs : on n'envoie que ce qui change
    titre: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    etiquette: Optional[str] = Field(default=None, min_length=1, max_length=50)
    publie: Optional[bool] = None


class LivrableLecture(BaseModel):
    id: int
    titre: str
    description: str
    etiquette: str
    fichier: Optional[str]
    publie: bool
    publie_le: Optional[datetime]
    cree_le: datetime
    modifie_le: datetime
