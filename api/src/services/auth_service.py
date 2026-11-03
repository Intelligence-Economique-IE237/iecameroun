from sqlmodel import Session, select

from src.core.erreurs import NonAutorise
from src.core.security import creer_jeton, verifier_mot_de_passe
from src.models import Utilisateur


def connecter(session: Session, email: str, mot_de_passe: str) -> str:
    """Vérifie les identifiants et renvoie un jeton de connexion."""
    utilisateur = session.exec(select(Utilisateur).where(Utilisateur.email == email.lower())).first()
    if not utilisateur or not verifier_mot_de_passe(mot_de_passe, utilisateur.mot_de_passe_hash):
        raise NonAutorise("Email ou mot de passe incorrect")
    return creer_jeton(utilisateur.id)
