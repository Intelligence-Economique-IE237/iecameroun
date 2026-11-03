// Registre des événements IE237.
//
// Pour ajouter un événement :
//   1. créer src/data/evenements/<slug>.js sur le modèle de mopiet-2026.js
//      (seuls slug, sigle, type, titre, debut, fin, dates et lieu sont
//      obligatoires ; programme, modules et galerie sont facultatifs) ;
//   2. déposer ses photos dans src/assets/evenements/<slug>/ (chargées
//      automatiquement) et ses autres fichiers (PDF…) dans public/evenements/<slug>/ ;
//   3. l'importer et l'ajouter au tableau ci-dessous.
// La page /evenements/<slug> est alors créée automatiquement.

import photoDates from "virtual:photo-dates";
import mopiet2026 from "./mopiet-2026";

// Toutes les images des dossiers src/assets/evenements/<slug>/,
// résolues au build en URL versionnées (ex. /assets/photo-a1b2c3.webp).
const images = import.meta.glob(
  "../../assets/evenements/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, query: "?url", import: "default" },
);

// Tri chronologique selon la date de prise de vue (EXIF), lue au build
// par vite-plugins/photoDates.js. Les photos sans date passent à la fin,
// par ordre de nom de fichier.
const parDate = (a, b) => {
  if (a.date !== null && b.date !== null && a.date !== b.date) return a.date - b.date;
  if (a.date === null && b.date !== null) return 1;
  if (a.date !== null && b.date === null) return -1;
  return a.fichier.localeCompare(b.fichier, "fr", { numeric: true });
};

// { slug: [{ src, fichier }] }
const photosParSlug = Object.entries(images)
  .map(([chemin, src]) => {
    const [slug, fichier] = chemin.split("/").slice(-2);
    return { slug, fichier, src, date: photoDates[`${slug}/${fichier}`] ?? null };
  })
  .sort(parDate)
  .reduce((acc, { slug, fichier, src }) => {
    (acc[slug] ??= []).push({ src, fichier });
    return acc;
  }, {});

const avecGalerie = (evt) => ({
  ...evt,
  galerie: (photosParSlug[evt.slug] ?? []).map(({ src, fichier }) => ({
    src,
    fichier,
    legende: evt.legendes?.[fichier],
  })),
});

const evenements = [mopiet2026].map(avecGalerie);

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