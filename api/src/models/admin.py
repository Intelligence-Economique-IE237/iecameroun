from typing import Optional

from sqlmodel import Field, SQLModel


class Admin(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    mot_de_passe_hash: str
    nom: str = ""
