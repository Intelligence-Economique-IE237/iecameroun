from sqlmodel import Session, create_engine

from src.core.config import DATABASE_URL

# pool_pre_ping : vérifie la connexion avant chaque requête (évite les erreurs après une coupure)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Les tables ne sont PAS créées ici : le schéma est géré par Alembic.
#   alembic upgrade head   → applique les migrations


def get_session():
    with Session(engine) as session:
        yield session
