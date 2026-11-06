// Informations des pages « Mentions légales » et « Politique de confidentialité ».
//
// Les champs à null s'affichent sur le site sous la forme « À compléter » (en orange) :
// les renseigner ici avant la mise en ligne. Aucune de ces informations ne doit être inventée.

export const MISE_A_JOUR = "2026-11-04"; // date de la dernière modification des deux pages

export const editeur = {
  nom: "IE237 : Intelligence Économique 237",
  presentation: "Think-Do Tank républicain d'intelligence économique",
  // Ex. « Association régie par la loi n° 90/053 du 19 décembre 1990, déclarée sous le n° … »
  formeJuridique: null,
  siege: "Bastos, Yaoundé, Cameroun",
  email: "contact@iecameroun.cm",
  telephone: null,
  // Personne responsable de ce qui est publié sur le site (nom et fonction)
  directeurPublication: null,
};

// Où sont hébergés le site et l'API (nom de la société, adresse, site web)
export const hebergement = {
  site: null,
  api: null,
};

// Mesure d'audience : identifiant Google Analytics présent dans index.html
export const googleAnalytics = {
  identifiant: "G-S6Q54PJZWD",
  // Réglage « Conservation des données » de la propriété GA4 : « 2 mois » ou « 14 mois »
  conservation: null,
};

// Durée de conservation des messages reçus (contact, devis), ex. « 3 ans après le dernier échange »
export const conservationMessages = null;

// Durée de conservation des journaux techniques du serveur (adresses IP), ex. « 12 mois »
export const conservationJournaux = null;
