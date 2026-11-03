from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel

from src.models.actualite import maintenant


class Livrable(SQLModel, table=True):
    """Document PDF publié dans la section Livrables du site (étude, note de veille, fiche…)."""

    id: Optional[int] = Field(default=None, primary_key=True)
    titre: str = Field(max_length=200)
    description: str = Field(default="", max_length=500)
    etiquette: str = Field(default="Étude", max_length=50)  # badge affiché sur la carte
    fichier: Optional[str] = None  # chemin public, ex. /uploads/livrables/abc.pdf
    publie: bool = False
    publie_le: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    cree_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))
    modifie_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))
