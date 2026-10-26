// Registre des événements IE237.
//
// Pour ajouter un événement :
//   1. créer src/data/evenements/<slug>.js sur le modèle de mopiet-2026.js
//      (seuls slug, sigle, type, titre, debut, fin, dates et lieu sont
//      obligatoires ; programme, modules et galerie sont facultatifs) ;
//   2. déposer ses fichiers (photos, PDF) dans public/evenements/<slug>/ ;
//   3. l'importer et l'ajouter au tableau ci-dessous.
// La page /evenements/<slug> est alors créée automatiquement.

import mopiet2026 from "./mopiet-2026";

const evenements = [mopiet2026];

// Du plus récent au plus ancien
export const listeEvenements = [...evenements].sort((a, b) => b.debut.localeCompare(a.debut));

export const getEvenement = (slug) => evenements.find((e) => e.slug === slug);

// Date du jour à Yaoundé, au format AAAA-MM-JJ
export const todayInYaounde = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Douala" }).format(new Date());

// "a-venir" | "en-cours" | "passe"
export const statutEvenement = (evt, today = todayInYaounde()) => {
  if (today < evt.debut) return "a-venir";
  if (today > evt.fin) return "passe";
  return "en-cours";
};

export const STATUT_LABEL = {
  "a-venir": "À venir",
  "en-cours": "En cours",
  passe: "Terminé",
};
