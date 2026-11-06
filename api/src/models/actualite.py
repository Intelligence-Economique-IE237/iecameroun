from datetime import date, datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, Text
from sqlmodel import Field, SQLModel


def maintenant():
    return datetime.now(timezone.utc)


class Statut(str, Enum):
    """Circuit de validation : l'Éditeur rédige, l'Analyste valide, l'Éditeur publie."""

    BROUILLON = "brouillon"    # en cours de rédaction par l'Éditeur
    SOUMIS = "soumis"          # envoyé à l'Analyste pour validation
    A_CORRIGER = "a_corriger"  # renvoyé par l'Analyste avec un commentaire
    VALIDE = "valide"          # validé, prêt à être publié
    PUBLIE = "publie"          # en ligne sur le site


class Actualite(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titre: str = Field(max_length=200)
    slug: str = Field(unique=True, index=True, max_length=220)
    resume: str = Field(default="", max_length=500)
    contenu: str = Field(default="", sa_type=Text)  # HTML nettoyé (mise en forme de l'éditeur)
    image: Optional[str] = None  # chemin public, ex. /uploads/actualites/abc.webp
    # Compte qui a créé l'article ; son nom est recopié pour rester affiché même si le compte est supprimé
    auteur_id: Optional[int] = Field(default=None, foreign_key="utilisateur.id", ondelete="SET NULL")
    auteur: str = Field(default="", max_length=120)
    statut: str = Field(default=Statut.BROUILLON.value, max_length=20, index=True)
    publie: bool = False  # toujours égal à (statut == "publie"), utilisé par le site
    commentaire: str = Field(default="", sa_type=Text)  # dernier commentaire de l'Analyste
    soumis_le: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    valide_par: str = Field(default="", max_length=120)
    valide_le: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    lectures: int = 0  # nombre total de lectures sur le site
    publie_le: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    cree_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))
    modifie_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))


class LectureActualite(SQLModel, table=True):
    """Lectures d'une actualité, comptées par jour (aucune donnée sur les visiteurs)."""

    __tablename__ = "lecture_actualite"

    actualite_id: int = Field(foreign_key="actualite.id", ondelete="CASCADE", primary_key=True)
    jour: date = Field(primary_key=True)
    nombre: int = 0
