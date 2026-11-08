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

## Traduction automatique (site public et panneau admin)

Un bouton **FR | EN** apparaît dans l'en-tête du site et dans la barre latérale de l'admin
(ainsi que sur la page de connexion). Il traduit toute l'interface à la volée, y compris
les actualités, événements et livrables chargés depuis l'API.

- **Service** : [DeepL API Free](https://www.deepl.com/pro-api), gratuit jusqu'à 500 000 caractères par mois.
  Une fois ce plafond atteint, DeepL refuse les appels jusqu'au mois suivant : aucun frais possible.
- **Cache** : chaque texte n'est traduit qu'une seule fois. Les traductions sont gardées
  dans la table `traduction` de l'API (et dans le navigateur du visiteur) : le quota ne sert
  qu'aux textes nouveaux.
- **Automatique** : un visiteur dont le navigateur est en anglais voit directement le site en anglais.
  Son choix (FR ou EN) est ensuite mémorisé.
- **Jamais traduits** : champs de saisie, éditeur de texte, code, et tout élément marqué
  `translate="no"` (ex. le nom IE237). L'admin rédige donc toujours en français.

### Mise en place (variables de l'API, dans Coolify)

| Variable | Rôle |
|---|---|
| `DEEPL_API_KEY` | Clé DeepL API Free (se termine par `:fx`). Sans clé, le bouton est masqué. |
| `TRADUCTION_LANGUES` | Langues proposées en plus du français. Défaut : `en`. Ex. `en,es,de` |
| `TRADUCTION_QUOTA_IP_HEURE` | Caractères nouveaux qu'une même IP peut faire traduire par heure. Défaut : `30000` |
| `LIBRETRANSLATE_URL` | (Facultatif) Alternative libre et sans quota si aucune clé DeepL : URL d'une instance [LibreTranslate](https://github.com/LibreTranslate/LibreTranslate) auto-hébergée |
| `LIBRETRANSLATE_API_KEY` | (Facultatif) Clé de cette instance, si elle en exige une |

Puis appliquer la migration : `alembic upgrade head` (crée la table `traduction`).

Le code est dans `app/src/traduction/` et `admin/src/traduction/` (le fichier `traducteur.js`
est identique dans les deux), et côté API dans `src/services/traduction_service.py`.
