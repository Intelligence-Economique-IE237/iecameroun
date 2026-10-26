// Événement MOPIET 2026
//
// kind :
//   "module"    → module de formation
//   "exercice"  → exercice pratique
//   "officiel"  → protocole, allocutions, cérémonies
//   "pause"     → accueil, pauses, collations
//   "synthese"  → synthèse et fin des travaux
// Une entrée { divider: "..." } affiche un intertitre dans la journée.


const jours = [
  {
    numero: 1,
    date: "2026-10-26",
    label: "Lundi 26 octobre",
    titre: "Session d'ouverture",
    programme: [
      { time: "07h30 – 08h30", activity: "Accueil, enregistrement des participants et remise des kits", speaker: "Protocole", kind: "pause" },
      { time: "08h30 – 09h00", activity: "Installation des participants et des invités", speaker: "Protocole", kind: "officiel" },
      { time: "09h00 – 09h10", activity: "Arrivée et installation des Autorités (MINEPAT, MINFI, MINREX et MINDDEVEL), Gouverneur du Centre", speaker: "Protocole", kind: "officiel" },
      { time: "09h15", activity: "Arrivée du Représentant de la Présidence de la République du Cameroun", speaker: "Protocole", kind: "officiel" },
      { divider: "Cérémonie d'ouverture" },
      { time: "09h25 – 09h30", activity: "Exécution de l'Hymne national", speaker: "Maître de cérémonie", kind: "officiel" },
      { time: "09h30 – 09h40", activity: "Allocution du Représentant de la Présidence de la République du Cameroun", speaker: "Directeur Général de la Recherche Extérieure", kind: "officiel" },
      { time: "09h40 – 09h55", activity: "Point de situation sur les activités du Think-Do Tank IE237", speaker: "Coordonnateur du Think-Do Tank IE237", kind: "officiel" },
      { time: "09h55 – 10h10", activity: "Leçon inaugurale : rappel des fondamentaux sur l'Intelligence Économique, aperçu MOPIET", speaker: "Président du CAVIE", kind: "officiel" },
      { time: "10h10 – 10h20", activity: "Photo de famille", speaker: "Protocole / Pôle Communication", kind: "officiel" },
      { time: "10h20 – 10h50", activity: "Pause-café d'honneur", speaker: "Commission logistique", kind: "pause" },
      { divider: "Début des travaux" },
      { time: "11h00 – 12h30", activity: "Module 1 – Nouveaux terrains d'application de l'intelligence économique : droit, sport, culture, technologies et territoires", speaker: "CAVIE", kind: "module" },
      { time: "12h30 – 13h30", activity: "Pause-déjeuner", speaker: "Commission logistique", kind: "pause" },
      { time: "13h30 – 15h30", activity: "Exercice pratique : analyse de cas de captation d'information stratégique et évaluation des failles dans un contexte local", speaker: "Participants", kind: "exercice" },
      { time: "15h30 – 16h00", activity: "Synthèse de la journée, fin des travaux", speaker: "Secrétariat technique", kind: "synthese" },
      { time: "16h00", activity: "Collation", speaker: "Commission logistique", kind: "pause" },
    ],
  },
  {
    numero: 2,
    date: "2026-10-27",
    label: "Mardi 27 octobre",
    titre: "Cadre normatif et volet défensif",
    programme: [
      { time: "08h30", activity: "Début des travaux", speaker: "", kind: "synthese" },
      { time: "08h30 – 10h00", activity: "Module 2 – Cadre normatif et institutionnel des CTD au Cameroun : analyse du Code général des CTD (Loi n°2019/024 du 24 décembre 2019) et enjeux de la décentralisation", speaker: "MINDDEVEL – CAVIE", kind: "module" },
      { time: "10h00 – 10h30", activity: "Pause-café", speaker: "Commission logistique", kind: "pause" },
      { time: "10h30 – 12h00", activity: "Module 3 – Volet défensif de l'Intelligence territoriale : protection du patrimoine public et privé, sécurité économique, contre-ingérence et protection des données territoriales", speaker: "Gouverneur Région du Centre – CAVIE", kind: "module" },
      { time: "12h00 – 13h00", activity: "Pause-déjeuner", speaker: "Commission logistique", kind: "pause" },
      { time: "13h00 – 15h00", activity: "Exercice pratique : réalisation d'un audit de sécurité économique d'une commune face aux risques de prédation d'actifs stratégiques", speaker: "Participants", kind: "exercice" },
      { time: "15h00 – 15h30", activity: "Synthèse de la journée et fin des travaux", speaker: "Secrétariat technique", kind: "synthese" },
      { time: "16h00", activity: "Collation", speaker: "Commission logistique", kind: "pause" },
    ],
  },
  {
    numero: 3,
    date: "2026-10-28",
    label: "Mercredi 28 octobre",
    titre: "Volet offensif et investisseurs",
    programme: [
      { time: "08h30", activity: "Début des travaux", speaker: "", kind: "synthese" },
      { time: "08h30 – 10h00", activity: "Module 4 – Volet offensif de l'IET : détection proactive des tendances économiques, veille concurrentielle sous-régionale et identification des niches de croissance locale", speaker: "CAVIE", kind: "module" },
      { time: "10h00 – 10h30", activity: "Pause-café", speaker: "Commission logistique", kind: "pause" },
      { time: "10h30 – 12h00", activity: "Module 5 – Méthodologie de validation des investisseurs : critères de base", speaker: "MINEPAT – MINREX – CAVIE – DGRE", kind: "module" },
      { time: "12h00 – 13h00", activity: "Pause-déjeuner", speaker: "Commission logistique", kind: "pause" },
      { time: "13h00 – 15h00", activity: "Exercice pratique : investigation et audit de réputation minimale sur un groupe international soumissionnant pour une concession d'infrastructures communales", speaker: "Participants", kind: "exercice" },
      { time: "15h00 – 15h30", activity: "Synthèse de la journée, évaluation et fin des travaux", speaker: "Secrétariat technique", kind: "synthese" },
      { time: "15h30", activity: "Collation", speaker: "Commission logistique", kind: "pause" },
    ],
  },
  {
    numero: 4,
    date: "2026-10-29",
    label: "Jeudi 29 octobre",
    titre: "Influence et projets bancables",
    programme: [
      { time: "08h30", activity: "Début des travaux", speaker: "", kind: "synthese" },
      { time: "08h30 – 10h00", activity: "Module 6 – Volet influence de l'IET : storytelling communal, diplomatie décentralisée, réseaux de coopération et lutte contre le bashing ou la désinformation", speaker: "CAVIE – MINREX", kind: "module" },
      { time: "10h00 – 10h30", activity: "Pause-café", speaker: "Commission logistique", kind: "pause" },
      { time: "10h30 – 12h00", activity: "Module 7 – Méthodologie de transformation des problèmes communaux en projets bancables : diagnostic local, structuration financière et technique aux standards internationaux et ciblage des investisseurs", speaker: "CAVIE – MINREX", kind: "module" },
      { time: "12h00 – 13h00", activity: "Pause-déjeuner", speaker: "Commission logistique", kind: "pause" },
      { time: "13h00 – 15h00", activity: "Exercice pratique : transformation d'une problématique concrète d'une commune camerounaise en fiche-projet bancable et attractive", speaker: "Participants", kind: "exercice" },
      { time: "15h00 – 15h30", activity: "Synthèse de la journée, évaluation et fin des travaux", speaker: "Secrétariat technique", kind: "synthese" },
      { time: "15h30", activity: "Collation", speaker: "Commission logistique", kind: "pause" },
    ],
  },
  {
    numero: 5,
    date: "2026-10-30",
    label: "Vendredi 30 octobre",
    titre: "Clôture solennelle",
    programme: [
      { time: "08h30", activity: "Début des travaux", speaker: "", kind: "synthese" },
      { time: "08h30 – 10h00", activity: "Module 8 – Gouvernance et conduite des partenariats public-privé au niveau communal : comité de pilotage, suivi stratégique et plateforme de rencontres d'affaires", speaker: "CAVIE", kind: "module" },
      { time: "10h00 – 10h30", activity: "Pause-café", speaker: "Commission logistique", kind: "pause" },
      { time: "10h30 – 12h00", activity: "Module 9 – Conception et déploiement d'une cellule locale de veille et d'intelligence économique territoriale (VIET) au sein d'une CTD ou d'une préfecture", speaker: "CAVIE", kind: "module" },
      { time: "12h00 – 13h00", activity: "Pause-déjeuner", speaker: "Commission logistique", kind: "pause" },
      { time: "13h00 – 13h20", activity: "Arrivée et installation des autorités", speaker: "Protocole", kind: "officiel" },
      { time: "13h30", activity: "Arrivée du Représentant de la Présidence de la République du Cameroun", speaker: "Protocole", kind: "officiel" },
      { time: "13h30 – 14h30", activity: "Exercice de synthèse : simulation d'une crise d'ingérence économique sur une CTD combinant attaque réputationnelle, risque de capture de ressource et projet d'investissement à valider en urgence", speaker: "Participants", kind: "exercice" },
      { divider: "Cérémonie de clôture" },
      { time: "14h30 – 14h40", activity: "Lecture du rapport général de la formation", speaker: "Coordonnateur du Think-Do Tank IE237", kind: "officiel" },
      { time: "14h40 – 14h45", activity: "Allocution du Président du CAVIE", speaker: "Dr Guy GWETH", kind: "officiel" },
      { time: "14h45 – 15h15", activity: "Allocution des autorités", speaker: "Autorités", kind: "officiel" },
      { time: "15h15 – 15h45", activity: "Remise des certificats CAVIE aux participants", speaker: "Autorités / CAVIE", kind: "officiel" },
      { time: "15h45 – 15h55", activity: "Discours de clôture", speaker: "Directeur Général de la Recherche Extérieure", kind: "officiel" },
      { time: "15h55 – 16h00", activity: "Exécution de l'Hymne national", speaker: "Maître de cérémonie", kind: "officiel" },
      { time: "16h00 – 16h15", activity: "Photo de famille", speaker: "Pôle Communication", kind: "officiel" },
      { time: "16h30", activity: "Cocktail de clôture", speaker: "Commission logistique", kind: "pause" },
    ],
  },
];

// Les 9 modules, regroupés par volet de l'intelligence économique territoriale
const volets = [
  { titre: "Fondamentaux", modules: [1, 2] },
  { titre: "Volet défensif", modules: [3] },
  { titre: "Volet offensif", modules: [4, 5] },
  { titre: "Volet influence", modules: [6] },
  { titre: "Mise en œuvre", modules: [7, 8, 9] },
];

// Photos : déposer les fichiers dans public/evenements/mopiet-2026/
// puis les ajouter ici, par exemple :
//   { src: "/evenements/mopiet-2026/ouverture-01.webp", legende: "Cérémonie d'ouverture" },
const galerie = [];

const mopiet2026 = {
  slug: "mopiet-2026",
  sigle: "MOPIET 2026",
  type: "Formation",
  theme: "Intelligence économique territoriale",
  titre:
    "Session de formation sur les Méthodes et Outils Pratiques d'Intelligence Économique Territoriale",
  resume:
    "Cinq jours de formation pour outiller les collectivités territoriales décentralisées en intelligence économique : volets défensif, offensif et d'influence, validation des investisseurs et projets bancables.",
  debut: "2026-10-26",
  fin: "2026-10-30",
  dates: "Du lundi 26 au vendredi 30 octobre 2026",
  lieu: "Bastos, Yaoundé",
  couverture: null,
  infos: [
    { icon: "users", label: "Organisateurs", value: "DGRE – CAVIE – IE237" },
    { icon: "graduation", label: "Formateur principal", value: "Dr Guy GWETH" },
    { icon: "user-check", label: "Point focal", value: "Dr KITIO Victor" },
  ],
  document: { href: "/evenements/mopiet-2026/Chronogramme_MOPIET_2026.pdf", label: "Télécharger le chronogramme (PDF)" },
  jours,
  volets,
  certification:
    "À l'issue de la session, un certificat CAVIE est remis aux participants lors de la cérémonie de clôture du vendredi 30 octobre 2026.",
  galerie,
};

export default mopiet2026;
