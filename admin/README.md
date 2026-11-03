# Panneau d'administration IE237

React 18 + Vite + Tailwind CSS 4, en JSX. Il parle à l'API du dossier `api/`.

## Lancer en local

L'API doit tourner sur http://localhost:8000 (voir `api/README.md`). Son `CORS_ORIGINS` doit contenir `http://localhost:5174`.

```bash
cd admin
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8000
npm run dev               # http://localhost:5174
```

Connecte-toi avec un compte créé par `python -m scripts.creer_admin` (dans `api/`).

## Pages

| Page | Admin | Éditeur |
|---|---|---|
| Tableau de bord : chiffres et derniers contenus | ✅ | ✅ |
| Actualités : liste, recherche, filtre, création, modification, image, publication | ✅ | ✅ |
| Livrables : liste, création, envoi du PDF, publication | ✅ | ✅ |
| Supprimer une actualité ou un livrable | ✅ | ❌ (bouton masqué, API en 403) |
| Utilisateurs : comptes et rôles | ✅ | ❌ (menu masqué, page redirigée) |

Masquer les boutons ne sert qu'au confort d'utilisation. La vraie protection, c'est l'API, qui vérifie le rôle à chaque requête.

## Organisation du code

```
src/
├── api/            client.js (fetch + jeton) et index.js (une fonction par route de l'API)
├── context/        AuthContext : utilisateur connecté, connexion, déconnexion, rôle
├── components/
│   ├── layout/     barre latérale et en-tête de page
│   └── ui/         boutons, champs, badges, cartes, tableaux, fenêtres, envoi de fichier
├── pages/          une page par écran (actualites/, livrables/, utilisateurs/)
└── utils/          formats de date, chargement des données
```

## Mise en production (Coolify)

1. Créer une application à partir du dépôt, avec le dossier de base `/admin` et le build pack **Nixpacks** ou **Static**.
2. Commande de build : `npm ci && npm run build`. Dossier publié : `dist`.
3. Variable **au build** : `VITE_API_URL=https://api.iecameroun.cm`. Elle est lue pendant `npm run build`, pas au démarrage : après l'avoir changée, il faut redéployer.
4. Activer la redirection SPA : toutes les routes doivent renvoyer vers `index.html`. Sinon, recharger `/actualites` donne une erreur 404.
5. Côté API, ajouter l'adresse de l'admin dans `CORS_ORIGINS`, par exemple `https://admin.iecameroun.cm`.
