from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Text, UniqueConstraint
from sqlmodel import Field, SQLModel

from src.models.actualite import maintenant


class Traduction(SQLModel, table=True):
    """Cache des traductions automatiques : chaque texte n'est envoyé qu'une fois au service.

    `empreinte` = SHA-256 du texte source (sert d'index : le texte lui-même peut être long).
    """

    __table_args__ = (UniqueConstraint("langue", "empreinte", name="uq_traduction_langue_empreinte"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    langue: str = Field(max_length=10)
    empreinte: str = Field(max_length=64)
    source: str = Field(sa_type=Text)
    texte: str = Field(sa_type=Text)
    cree_le: datetime = Field(default_factory=maintenant, sa_type=DateTime(timezone=True))
