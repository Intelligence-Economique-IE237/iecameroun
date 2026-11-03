# API IE237 (FastAPI + PostgreSQL)

## Organisation du code

```
api/
├── src/
│   ├── main.py            démarrage, CORS, erreurs, branchement des routes
│   ├── core/              configuration, base de données, sécurité, dépendances
│   ├── models/            tables de la base (SQLModel)
│   ├── schemas/           formats des données qui entrent et sortent de l'API
│   ├── services/          logique métier : tout accès à la base passe par ici
│   ├── controllers/       reçoivent la requête, appellent le service, renvoient la réponse
│   └── routes/            associent chaque URL à son controller
├── migrations/            migrations Alembic (historique du schéma de la base)
├── scripts/               creer_admin.py (premier Admin), importer_livrables.py (PDF actuels du site)
├── postman/               collection et environnement Postman
└── tests/                 tests automatiques (pytest)
```

Une requête suit le chemin **route → controller → service → model**. Pour ajouter une rubrique (galerie, documents…), on crée un fichier dans chaque dossier, sur le modèle d'`actualite`.

## Installer et lancer en local

Prérequis : Python 3.13 et PostgreSQL installé sur ta machine.

Créer les deux bases une seule fois, dans `psql` :

```sql
CREATE USER ie237 WITH PASSWORD 'ie237';
CREATE DATABASE ie237 OWNER ie237;
CREATE DATABASE ie237_test OWNER ie237;
```

```bash
cd api
python -m venv venv
source venv/bin/activate             # Windows : venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env                 # puis remplir JWT_SECRET
alembic upgrade head                 # crée / met à jour les tables
python -m scripts.creer_admin admin@iecameroun.cm "Nom Prénom"
uvicorn src.main:app --reload
```

## Rôles

| Action | Admin | Éditeur |
|---|---|---|
| Créer, modifier, publier une actualité ou un livrable, envoyer image / PDF | ✅ | ✅ |
| Supprimer une actualité ou un livrable | ✅ | ❌ |
| Gérer les comptes (`/admin/utilisateurs`) | ✅ | ❌ |

Le premier Admin se crée avec `python -m scripts.creer_admin email "Nom"`. Pour un Éditeur, ajouter `editeur` à la fin de la commande. Les comptes suivants se créent depuis le panneau, ou via `POST /admin/utilisateurs`.
Deux garde-fous : un Admin ne peut pas supprimer son propre compte, et le dernier Admin ne peut pas être rétrogradé.

Pour protéger une route, on ajoute `dependencies=[connecte]` (Admin ou Éditeur) ou `dependencies=[admin_seulement]` (Admin uniquement). Ces deux raccourcis viennent de `src/core/dependencies.py`.

## Livrables

Les livrables (études, notes de veille, fiches d'analyse) se postent depuis le panneau admin :
1. Créer le livrable (titre, description, étiquette). Il est toujours créé en brouillon.
2. Envoyer le PDF (20 Mo max). Le serveur vérifie que c'est un vrai PDF, pas un fichier renommé.
3. Publier. La publication est refusée tant qu'aucun PDF n'a été envoyé.

Pour reprendre les 4 PDF actuellement écrits en dur dans le site, lance une seule fois :
`python -m scripts.importer_livrables ../app/public/Docs`. Le relancer ne crée pas de doublon.

## Modifier le schéma de la base (migrations)

Les tables ne sont jamais créées automatiquement : tout passe par Alembic.

1. Modifier ou ajouter un modèle dans `src/models/`. Un nouveau fichier doit aussi être ajouté dans `src/models/__init__.py`.
2. Générer la migration : `alembic revision --autogenerate -m "ajout table galerie"`
3. **Relire** le fichier créé dans `migrations/versions/` : Alembic peut se tromper, par exemple sur un renommage de colonne, qu'il traite comme une suppression suivie d'un ajout.
4. Appliquer : `alembic upgrade head`
5. Commiter le fichier de migration avec le code.

Commandes utiles : `alembic current` affiche la version actuelle de la base, `alembic history` liste les migrations, `alembic downgrade -1` annule la dernière, et `alembic check` vérifie qu'aucun changement de modèle n'est oublié.

## Tester avant de pousser

1. **Tests automatiques** : `pytest`. Ils doivent tous passer. Ils utilisent la base `ie237_test`, qui est vidée à chaque test, jamais ta base de travail. Ils appliquent aussi toutes les migrations, ce qui permet de les vérifier.
   Lance aussi `alembic check` : la commande doit répondre « No new upgrade operations detected ». Sinon, une migration manque.
2. **Test manuel** : ouvre http://localhost:8000/docs.
   - Clique sur **Authorize** et saisis l'email et le mot de passe admin (laisse les autres champs vides).
   - `POST /admin/actualites` → **Try it out** → crée une actualité avec `"publie": true`.
   - `POST /admin/actualites/{id}/image` → envoie une photo.
   - `GET /actualites` → l'actualité apparaît. Ouvre `http://localhost:8000` suivi du chemin `image` pour voir la photo.

3. **Postman** :
   - Dans Postman, faire **Import** et choisir les deux fichiers du dossier `postman/`.
   - Sélectionner l'environnement **IE237 local** en haut à droite, puis remplir `mot_de_passe` (et `email` si besoin).
   - Lancer **Connexion › Se connecter** : le jeton est enregistré et réutilisé automatiquement par toutes les requêtes.
   - Chaque requête **Créer** mémorise l'id créé, réutilisé par les requêtes suivantes du dossier.
   - Pour **Envoyer l'image** et **Envoyer le PDF**, choisir le fichier dans l'onglet **Body**, champ `fichier`.
   - Pour tout enchaîner d'un coup : clic droit sur la collection › **Run collection**.
   - Pour tester les droits de l'Éditeur, changer `email` et `mot_de_passe` dans l'environnement, puis se reconnecter : les suppressions et le dossier Utilisateurs doivent renvoyer 403.

Pour arrêter l'API : `Ctrl+C`.

## Routes

| Méthode | Route | Accès |
|---|---|---|
| POST | `/auth/login` | public (formulaire `username` = email, `password`) |
| GET | `/auth/moi` | connecté (renvoie aussi le `role`) |
| GET | `/actualites` | public, actualités publiées uniquement |
| GET | `/actualites/{slug}` | public |
| GET / POST | `/admin/actualites` | Admin, Éditeur |
| GET / PATCH | `/admin/actualites/{id}` | Admin, Éditeur |
| DELETE | `/admin/actualites/{id}` | Admin |
| POST | `/admin/actualites/{id}/image` | Admin, Éditeur (champ `fichier`, JPG/PNG/WEBP, 5 Mo max) |
| GET | `/livrables` | public, livrables publiés uniquement |
| GET / POST | `/admin/livrables` | Admin, Éditeur |
| GET / PATCH | `/admin/livrables/{id}` | Admin, Éditeur |
| DELETE | `/admin/livrables/{id}` | Admin |
| POST | `/admin/livrables/{id}/fichier` | Admin, Éditeur (champ `fichier`, PDF, 20 Mo max) |
| GET / POST | `/admin/utilisateurs` | Admin |
| GET / PATCH / DELETE | `/admin/utilisateurs/{id}` | Admin |

## Déploiement sur Coolify

1. Créer une base **PostgreSQL** dans Coolify et récupérer son URL interne. Remplacer `postgresql://` par `postgresql+psycopg://`.
2. Créer une application à partir du dépôt, avec le dossier de base `/api` et le build pack **Nixpacks**, et la commande de démarrage :
   `alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips '*'`
   Les migrations sont ainsi appliquées automatiquement à chaque déploiement.
3. Variables : `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` (`https://iecameroun.cm,https://admin.iecameroun.cm`).
4. Ajouter un **volume persistant** monté sur `/app/uploads`, pour que les images survivent aux redéploiements.
5. Après le premier déploiement, ouvrir le terminal du conteneur dans Coolify et lancer `python -m scripts.creer_admin ...`.
