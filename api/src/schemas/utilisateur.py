from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from src.models import Role


class UtilisateurCreation(BaseModel):
    email: EmailStr
    nom: str = Field(default="", max_length=120)
    role: Role = Role.EDITEUR
    mot_de_passe: str = Field(min_length=12)


class UtilisateurModification(BaseModel):
    # Tous les champs sont facultatifs : on n'envoie que ce qui change
    nom: Optional[str] = Field(default=None, max_length=120)
    role: Optional[Role] = None
    mot_de_passe: Optional[str] = Field(default=None, min_length=12)


class UtilisateurLecture(BaseModel):
    id: int
    email: str
    nom: str
    role: Role
