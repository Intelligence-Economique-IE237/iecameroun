// Client HTTP unique : toutes les pages passent par ici pour parler à l'API.

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const CLE_JETON = "ie237_admin_jeton";

export const jeton = {
  lire: () => {
    try {
      return localStorage.getItem(CLE_JETON);
    } catch {
      return null;
    }
  },
  ecrire: (valeur) => {
    try {
      localStorage.setItem(CLE_JETON, valeur);
    } catch {
      /* navigation privée : la session ne survivra pas au rechargement */
    }
  },
  effacer: () => {
    try {
      localStorage.removeItem(CLE_JETON);
    } catch {
      /* rien à faire */
    }
  },
};

// Appelée quand la session expire (branchée par AuthContext)
let surSessionExpiree = () => {};
export const quandSessionExpire = (fn) => {
  surSessionExpiree = fn;
};

export class ErreurApi extends Error {
  constructor(message, statut) {
    super(message);
    this.statut = statut;
  }
}

// FastAPI renvoie soit { detail: "texte" }, soit { detail: [{ msg, loc }] } pour les erreurs de validation
function messageErreur(corps, statut) {
  const detail = corps?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    const champ = detail[0].loc?.slice(-1)[0];
    return champ ? `${champ} : ${detail[0].msg}` : detail[0].msg;
  }
  if (statut === 403) return "Action non autorisée pour votre rôle";
  return "Une erreur est survenue. Réessayez.";
}

export async function requete(chemin, { methode = "GET", json, formulaire, fichier } = {}) {
  const entetes = {};
  let corps;

  const t = jeton.lire();
  if (t) entetes.Authorization = `Bearer ${t}`;

  if (json !== undefined) {
    entetes["Content-Type"] = "application/json";
    corps = JSON.stringify(json);
  } else if (formulaire) {
    corps = new URLSearchParams(formulaire);
  } else if (fichier) {
    corps = new FormData();
    corps.append("fichier", fichier);
  }

  let reponse;
  try {
    reponse = await fetch(`${API_URL}${chemin}`, { method: methode, headers: entetes, body: corps });
  } catch {
    throw new ErreurApi("Impossible de joindre l'API. Vérifiez votre connexion.", 0);
  }

  if (reponse.status === 204) return null;
  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    if (reponse.status === 401 && t) surSessionExpiree();
    throw new ErreurApi(messageErreur(donnees, reponse.status), reponse.status);
  }
  return donnees;
}

// Les chemins de fichiers renvoyés par l'API (/uploads/...) sont relatifs à l'API
export const urlFichier = (chemin) => (chemin ? `${API_URL}${chemin}` : null);
