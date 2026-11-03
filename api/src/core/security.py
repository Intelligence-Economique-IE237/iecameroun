"""Mots de passe (bcrypt) et jetons de connexion (JWT)."""
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from src.core.config import JWT_SECRET

ALGORITHME = "HS256"
DUREE_JETON = timedelta(hours=8)


def hacher_mot_de_passe(mot_de_passe: str) -> str:
    return bcrypt.hashpw(mot_de_passe.encode(), bcrypt.gensalt()).decode()


def verifier_mot_de_passe(mot_de_passe: str, hash_: str) -> bool:
    return bcrypt.checkpw(mot_de_passe.encode(), hash_.encode())


def creer_jeton(admin_id: int) -> str:
    donnees = {"sub": str(admin_id), "exp": datetime.now(timezone.utc) + DUREE_JETON}
    return jwt.encode(donnees, JWT_SECRET, algorithm=ALGORITHME)


def lire_jeton(jeton: str) -> int | None:
    """Renvoie l'id de l'admin, ou None si le jeton est invalide ou expiré."""
    try:
        return int(jwt.decode(jeton, JWT_SECRET, algorithms=[ALGORITHME])["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
