"""Importe (une seule fois) les 4 livrables écrits en dur dans le site (app/src/components/LivrablesCard.jsx).

Usage (depuis le dossier api/, après `alembic upgrade head`) :
    python -m scripts.importer_livrables ../app/public/Docs
Les livrables déjà importés (même titre et même description) sont ignorés : on peut relancer sans doublon.
"""
import os
import sys

from sqlmodel import Session, select

from src.core.database import engine
from src.models import Livrable
from src.schemas.livrable import LivrableCreation, LivrableModification
from src.services import livrable_service

# Copie des données de LivrablesCard.jsx (du plus ancien au plus récent, pour garder l'ordre d'affichage)
LIVRABLES = [
    ("Fiche d'Analyse", "Analyse du secteur minier camerounais", "Étude", "Fiche_analyse_les_mineraux_critiques_au_cameroun.pdf"),
    ("Fiche d'Analyse", "Analyse de l'économie camerounaise", "Étude", "Fiche_Cameroun_fiche_economique.pdf"),
    ("Note de veille Économique et Stratégique", "Balance Commerciale Camerounaise, Filière Coton, Filière Soja", "Étude", "Note_veille_economique_et_strategique2.pdf"),
    ("Policy Brief — L'or camerounais", "Synthèse des activités et perspectives", "Étude", "PolicyBrief-l-or-camerounais.pdf"),
]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    dossier = sys.argv[1]

    with Session(engine) as session:
        for titre, description, etiquette, nom_pdf in LIVRABLES:
            deja = session.exec(
                select(Livrable).where(Livrable.titre == titre, Livrable.description == description)
            ).first()
            if deja:
                print(f"Ignoré (déjà présent) : {titre} — {description}")
                continue

            chemin = os.path.join(dossier, nom_pdf)
            with open(chemin, "rb") as f:
                contenu = f.read()

            livrable = livrable_service.creer(
                session, LivrableCreation(titre=titre, description=description, etiquette=etiquette)
            )
            livrable_service.changer_fichier(session, livrable.id, contenu, nom_pdf)
            livrable_service.modifier(session, livrable.id, LivrableModification(publie=True))
            print(f"Importé : {titre} — {description}")


if __name__ == "__main__":
    main()
