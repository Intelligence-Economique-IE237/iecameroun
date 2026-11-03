import { useEffect, useState } from "react";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

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
