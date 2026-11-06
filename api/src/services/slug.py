"""Fabrication des adresses lisibles (slugs) des pages du site."""
import re
import unicodedata

from sqlmodel import Session, select


def slugifier(texte: str, defaut: str = "page") -> str:
    # "Conférence à l'ENAM" → "conference-a-l-enam"
    texte = unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", texte.lower()).strip("-")[:200] or defaut


def slug_unique(session: Session, modele, texte: str, id_actuel: int | None = None, defaut: str = "page") -> str:
    """Ajoute -2, -3… si le slug est déjà pris par une autre ligne du même modèle."""
    base = slugifier(texte, defaut)
    slug, n = base, 2
    while True:
        existant = session.exec(select(modele).where(modele.slug == slug)).first()
        if not existant or existant.id == id_actuel:
            return slug
        slug, n = f"{base}-{n}", n + 1
