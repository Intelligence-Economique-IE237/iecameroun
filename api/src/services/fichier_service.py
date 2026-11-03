"""Enregistrement et suppression des fichiers envoyés (stockés sur le disque du serveur)."""
import os
import uuid

from src.core.config import UPLOAD_DIR
from src.core.erreurs import DonneesInvalides

EXTENSIONS_IMAGES = {".jpg", ".jpeg", ".png", ".webp"}
TAILLE_MAX_IMAGE = 5 * 1024 * 1024  # 5 Mo
TAILLE_MAX_PDF = 20 * 1024 * 1024  # 20 Mo


def _ecrire(contenu: bytes, extension: str, sous_dossier: str) -> str:
    """Écrit le fichier sous un nom aléatoire et renvoie son chemin public."""
    dossier = os.path.join(UPLOAD_DIR, sous_dossier)
    os.makedirs(dossier, exist_ok=True)
    nom = f"{uuid.uuid4().hex}{extension}"
    with open(os.path.join(dossier, nom), "wb") as f:
        f.write(contenu)
    return f"/uploads/{sous_dossier}/{nom}"


def enregistrer_image(contenu: bytes, nom_original: str, sous_dossier: str) -> str:
    """Enregistre l'image et renvoie son chemin public, ex. /uploads/actualites/abc.webp"""
    extension = os.path.splitext(nom_original or "")[1].lower()
    if extension not in EXTENSIONS_IMAGES:
        raise DonneesInvalides("Formats acceptés : JPG, PNG, WEBP")
    if len(contenu) > TAILLE_MAX_IMAGE:
        raise DonneesInvalides("Image trop lourde (5 Mo maximum)")
    return _ecrire(contenu, extension, sous_dossier)


def enregistrer_pdf(contenu: bytes, nom_original: str, sous_dossier: str) -> str:
    """Enregistre le PDF et renvoie son chemin public, ex. /uploads/livrables/abc.pdf"""
    if os.path.splitext(nom_original or "")[1].lower() != ".pdf":
        raise DonneesInvalides("Seuls les fichiers PDF sont acceptés")
    # Un vrai PDF commence toujours par "%PDF-" (protège contre un fichier simplement renommé)
    if not contenu.startswith(b"%PDF-"):
        raise DonneesInvalides("Le fichier n'est pas un PDF valide")
    if len(contenu) > TAILLE_MAX_PDF:
        raise DonneesInvalides("PDF trop lourd (20 Mo maximum)")
    return _ecrire(contenu, ".pdf", sous_dossier)


def supprimer_fichier(chemin_public: str | None):
    if not chemin_public:
        return
    chemin = os.path.join(UPLOAD_DIR, chemin_public.removeprefix("/uploads/"))
    if os.path.isfile(chemin):
        os.remove(chemin)
