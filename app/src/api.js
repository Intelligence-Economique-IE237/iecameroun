import { useEffect, useState } from "react";

// Adresse de l'API : VITE_API_URL si elle est fournie au build,
// sinon l'API de production une fois le site construit, et l'API locale en développement.
const API_PAR_DEFAUT = import.meta.env.PROD ? "https://api.iecameroun.cm" : "http://localhost:8000";
export const API_URL = (import.meta.env.VITE_API_URL || API_PAR_DEFAUT).replace(/\/$/, "");

// Les chemins de fichiers renvoyés par l'API (/uploads/...) sont relatifs à l'API
export const urlFichier = (chemin) => (chemin ? `${API_URL}${chemin}` : null);

export class Introuvable extends Error {}

async function lire(chemin) {
  const reponse = await fetch(`${API_URL}${chemin}`);
  if (reponse.status === 404) throw new Introuvable();
  if (!reponse.ok) throw new Error(`Erreur API ${reponse.status}`);
  return reponse.json();
}

export const getActualites = () => lire("/actualites");
export const getActualite = (slug) => lire(`/actualites/${encodeURIComponent(slug)}`);
export const getLivrables = () => lire("/livrables");
// Compte une lecture de l'article, une seule fois par session de navigation
// (rien n'est enregistré sur le visiteur : seul un compteur augmente côté serveur)
export const compterLecture = (slug) => {
  const cle = `ie237-lu-${slug}`;
  try {
    if (sessionStorage.getItem(cle)) return;
    sessionStorage.setItem(cle, "1");
  } catch {
    // stockage indisponible (navigation privée stricte) : on compte quand même
  }
  fetch(`${API_URL}/actualites/${encodeURIComponent(slug)}/lecture`, { method: "POST", keepalive: true }).catch(() => {});
};
export const getEvenementsApi = () => lire("/evenements");
export const getEvenementApi = (slug) => lire(`/evenements/${encodeURIComponent(slug)}`);

// Charge une ressource : { donnees, chargement, erreur }
export function useApi(charger, cle) {
  const [etat, setEtat] = useState({ donnees: null, chargement: true, erreur: null });

  useEffect(() => {
    let annule = false;
    setEtat({ donnees: null, chargement: true, erreur: null });
    charger()
      .then((donnees) => !annule && setEtat({ donnees, chargement: false, erreur: null }))
      .catch((erreur) => !annule && setEtat({ donnees: null, chargement: false, erreur }));
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  return etat;
}

const formatDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Douala",
});
export const dateLongue = (iso) => (iso ? formatDate.format(new Date(iso)) : "");
