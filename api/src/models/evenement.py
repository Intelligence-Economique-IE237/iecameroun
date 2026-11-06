from datetime import date, datetime
from typing import Optional

from sqlalchemy import JSON, Column, DateTime, Text
from sqlmodel import Field, SQLModel

from src.models.actualite import maintenant


class Evenement(SQLModel, table=True):
    """Formation, conférence ou rencontre affichée dans la rubrique Événements du site."""

    id: Optional[int] = Field(default=None, primary_key=True)
    sigle: str = Field(max_length=80)                    # ex. « MOPIET 2026 », sert aussi à l'adresse
    slug: str = Field(unique=True, index=True, max_length=220)
    type: str = Field(default="Formation", max_length=60)  # Formation, Conférence, Atelier…
    theme: str = Field(default="", max_length=120)
    titre: str = Field(max_length=300)                   # intitulé complet
    resume: str = Field(default="", max_length=500)
    description: str = Field(default="", sa_type=Text)   # HTML nettoyé (mise en forme de l'éditeur)
    debut: date
    fin: date
    lieu: str = Field(default="", max_length=200)
    # Informations complémentaires : [{"libelle": "Organisateurs", "valeur": "DGRE – CAVIE – IE237"}]
    infos: list = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    # Programme jour par jour : voir schemas/evenement.py (JourProgramme)
    programme: list = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    couverture: Optional[str] = None       # chemin public de l'image, ex. /uploads/evenements/abc.webp
    document: Optional[str] = None         # PDF facultatif (chronogramme, brochure…)
    document_libelle: str = Field(default="", max_length=120)
    publie: bool = False
    publie_le: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    cree_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))
    modifie_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))


class PhotoEvenement(SQLModel, table=True):
    """Photo de la galerie d'un événement."""

    __tablename__ = "photo_evenement"

    id: Optional[int] = Field(default=None, primary_key=True)
    evenement_id: int = Field(foreign_key="evenement.id", ondelete="CASCADE", index=True)
    chemin: str
    legende: str = Field(default="", max_length=200)
    ordre: int = 0
    cree_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))
