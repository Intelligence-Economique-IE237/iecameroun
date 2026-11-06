import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from src.core.config import CORS_ORIGINS, UPLOAD_DIR
from src.core.erreurs import DonneesInvalides, Interdit, Introuvable, NonAutorise
from src.routes import actualite_routes, auth_routes, evenement_routes, livrable_routes, utilisateur_routes

# Le schéma de la base est géré par Alembic : lancer `alembic upgrade head` avant de démarrer
app = FastAPI(title="API IE237")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Erreurs des services → réponses HTTP
def _erreur(code: int):
    async def handler(request: Request, exc: Exception):
        return JSONResponse(status_code=code, content={"detail": str(exc)})
    return handler


app.add_exception_handler(Introuvable, _erreur(404))
app.add_exception_handler(DonneesInvalides, _erreur(400))
app.add_exception_handler(NonAutorise, _erreur(401))
app.add_exception_handler(Interdit, _erreur(403))

# Images envoyées depuis l'admin, servies sur /uploads/...
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_routes.router)
app.include_router(utilisateur_routes.router)
app.include_router(actualite_routes.public)
app.include_router(actualite_routes.admin)
app.include_router(evenement_routes.public)
app.include_router(evenement_routes.admin)
app.include_router(livrable_routes.public)
app.include_router(livrable_routes.admin)


@app.get("/health", tags=["Santé"])
def health():
    return {"status": "ok"}
