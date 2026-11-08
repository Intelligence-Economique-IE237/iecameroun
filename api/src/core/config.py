"""Lecture des variables d'environnement (fichier .env en local, variables Coolify en production)."""
import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

# --- Traduction automatique (voir src/services/traduction_service.py) ---
# DeepL API Free : clé gratuite sur https://www.deepl.com/pro-api (500 000 caractères/mois).
# Une clé gratuite se termine par « :fx ».
DEEPL_API_KEY = os.getenv("DEEPL_API_KEY", "").strip()
# Solution de repli, sans quota : une instance LibreTranslate (logiciel libre, auto-hébergeable)
LIBRETRANSLATE_URL = os.getenv("LIBRETRANSLATE_URL", "").strip().rstrip("/")
LIBRETRANSLATE_API_KEY = os.getenv("LIBRETRANSLATE_API_KEY", "").strip()
# Langues proposées en plus du français (codes ISO 639-1, séparés par des virgules)
TRADUCTION_LANGUES = [
    code.strip().lower() for code in os.getenv("TRADUCTION_LANGUES", "en").split(",") if code.strip()
]
# Caractères NOUVEAUX (absents du cache) qu'une même adresse IP peut faire traduire par heure
TRADUCTION_QUOTA_IP_HEURE = int(os.getenv("TRADUCTION_QUOTA_IP_HEURE", "30000"))
