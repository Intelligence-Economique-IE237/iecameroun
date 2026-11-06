from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class Role(str, Enum):
    ADMIN = "admin"      # tout, y compris la gestion des comptes
    EDITEUR = "editeur"  # rédige et publie les actualités (une fois validées), gère les événements
    ANALYSTE = "analyste"  # valide les actualités avant publication, gère les livrables


class Utilisateur(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    mot_de_passe_hash: str
    nom: str = ""
    role: str = Field(default=Role.EDITEUR.value, max_length=20)
