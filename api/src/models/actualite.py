from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Text
from sqlmodel import Field, SQLModel


def maintenant():
    return datetime.now(timezone.utc)


class Actualite(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titre: str = Field(max_length=200)
    slug: str = Field(unique=True, index=True, max_length=220)
    resume: str = Field(default="", max_length=500)
    contenu: str = Field(default="", sa_type=Text)
    image: Optional[str] = None  # chemin public, ex. /uploads/actualites/abc.webp
    publie: bool = False
    publie_le: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    cree_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))
    modifie_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))
