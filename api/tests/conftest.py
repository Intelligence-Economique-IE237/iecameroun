"""Configuration des tests : base de test séparée, jamais la base de travail."""
import os
import tempfile

from dotenv import load_dotenv

# --- À exécuter AVANT tout import de src/ (qui lit DATABASE_URL) ---
load_dotenv()

url_test = os.getenv("TEST_DATABASE_URL")
if not url_test:
    raise SystemExit("Définir TEST_DATABASE_URL dans .env (base dédiée aux tests, elle est vidée à chaque test).")
if url_test == os.getenv("DATABASE_URL"):
    raise SystemExit("TEST_DATABASE_URL doit être différente de DATABASE_URL.")

os.environ["DATABASE_URL"] = url_test
os.environ.setdefault("JWT_SECRET", "secret-de-test")
os.environ["UPLOAD_DIR"] = tempfile.mkdtemp(prefix="ie237-tests-")

# --- Fixtures partagées par tous les fichiers de tests ---
import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402
from sqlmodel import Session  # noqa: E402

from src.core.database import engine  # noqa: E402
from src.main import app  # noqa: E402
from src.models import Role  # noqa: E402
from src.services import utilisateur_service  # noqa: E402

MDP = "motdepasse-de-test"
EMAIL_ADMIN = "admin@test.cm"
EMAIL_EDITEUR = "editeur@test.cm"


@pytest.fixture()
def client():
    # Base vide + toutes les migrations Alembic, puis un Admin et un Éditeur
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
    command.upgrade(Config("alembic.ini"), "head")
    with Session(engine) as session:
        utilisateur_service.enregistrer_ou_reinitialiser(session, EMAIL_ADMIN, MDP, "Admin", Role.ADMIN)
        utilisateur_service.enregistrer_ou_reinitialiser(session, EMAIL_EDITEUR, MDP, "Éditeur", Role.EDITEUR)
    with TestClient(app) as c:
        yield c


def _entetes(client, email):
    r = client.post("/auth/login", data={"username": email, "password": MDP})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture()
def admin(client):
    return _entetes(client, EMAIL_ADMIN)


@pytest.fixture()
def editeur(client):
    return _entetes(client, EMAIL_EDITEUR)
