"""Lecture des variables d'environnement (fichier .env en local, variables Coolify en production)."""
import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
