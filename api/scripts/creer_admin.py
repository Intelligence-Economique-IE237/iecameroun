"""Crée (ou réinitialise) un compte du panneau admin.

Usage (depuis le dossier api/, après `alembic upgrade head`) :
    python -m scripts.creer_admin email@iecameroun.cm "Nom affiché"            → rôle Admin
    python -m scripts.creer_admin email@iecameroun.cm "Nom affiché" editeur    → rôle Éditeur
Le mot de passe est demandé au clavier (il ne s'affiche pas).
Sert surtout à créer le tout premier Admin ; les comptes suivants se créent depuis le panneau.
"""
import sys
from getpass import getpass

from sqlmodel import Session

from src.core.database import engine
from src.core.erreurs import DonneesInvalides
from src.models import Role
from src.services import utilisateur_service


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    email = sys.argv[1]
    nom = sys.argv[2] if len(sys.argv) > 2 else ""
    try:
        role = Role(sys.argv[3]) if len(sys.argv) > 3 else Role.ADMIN
    except ValueError:
        sys.exit("Rôle inconnu : utiliser admin ou editeur.")

    mot_de_passe = getpass("Mot de passe : ")
    if getpass("Confirmer : ") != mot_de_passe:
        sys.exit("Les mots de passe ne correspondent pas.")

    with Session(engine) as session:
        try:
            utilisateur = utilisateur_service.enregistrer_ou_reinitialiser(session, email, mot_de_passe, nom, role)
        except DonneesInvalides as e:
            sys.exit(str(e))
    print(f"Compte {utilisateur.email} enregistré (rôle : {utilisateur.role}).")


if __name__ == "__main__":
    main()
