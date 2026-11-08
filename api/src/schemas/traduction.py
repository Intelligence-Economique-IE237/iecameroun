"""Formats des données échangées avec le site et l'admin pour la traduction automatique."""
from pydantic import BaseModel, Field

# Limites d'une requête : une page est envoyée en plusieurs lots par le navigateur
MAX_TEXTES = 100
MAX_LONGUEUR_TEXTE = 5000


class DemandeTraduction(BaseModel):
    cible: str = Field(min_length=2, max_length=10, examples=["en"])
    textes: list[str] = Field(max_length=MAX_TEXTES)


class ReponseTraduction(BaseModel):
    cible: str
    traductions: list[str]  # même ordre que `textes`


class Langues(BaseModel):
    source: str
    cibles: list[str]
    active: bool  # False si aucun service de traduction n'est configuré
    version: str  # change quand le glossaire change : les navigateurs vident alors leur cache
