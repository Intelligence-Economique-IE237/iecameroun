// Traduction automatique de l'interface (fichier identique dans app/ et admin/).
//
// Principe : le site est écrit en français. Quand le visiteur choisit une autre langue,
// on parcourt les textes visibles de la page, on les envoie par lots à l'API
// (POST /traduction, qui interroge DeepL et garde chaque traduction en base),
// puis on remplace le texte affiché. Un MutationObserver traduit au fil de l'eau ce
// que React ajoute ou modifie (changement de page, données chargées, menus…).
//
// Rien n'est jamais traduit dans : champs de saisie, éditeur de texte, code, et tout
// élément marqué translate="no" ou de classe "notranslate" (ex. le nom IE237).
//
// Seul le contenu des nœuds texte est modifié (jamais la structure du DOM),
// ce qui reste compatible avec React.
//
// Phrases découpées (ex. <h1>Un Think-Do Tank <span>républicain</span></h1>) : la phrase
// est traduite EN ENTIER (sinon l'ordre des mots est faux), puis placée dans le premier
// morceau ; les autres morceaux sont vidés. Le gras ou l'italique à l'intérieur de la
// phrase est alors perdu en traduction. Les phrases contenant un lien ou un bouton restent
// traduites morceau par morceau, pour ne pas sortir le texte du lien.

import { useSyncExternalStore } from "react";

export const LANGUE_SOURCE = "fr";
export const NOMS_LANGUES = {
  fr: "Français",
  en: "English",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  ar: "العربية",
  zh: "中文",
};

const CLE_LANGUE = "ie237-langue";
let versionGlossaire = ""; // fournie par l'API : change quand le glossaire change
const CLE_CACHE = (langue) => `ie237-traductions-${langue}-${versionGlossaire}`;
const MAX_CACHE_LOCAL = 3000; // textes gardés dans le navigateur, par langue
const LOT_TEXTES = 100; // limite de l'API par requête
const LOT_CARACTERES = 20000;

const A_IGNORER = [
  "script", "style", "noscript", "code", "pre", "textarea", "svg", "kbd", "samp",
  "[translate='no']", ".notranslate", "[contenteditable]", "[contenteditable='true']",
].join(",");
const ATTRIBUTS = ["placeholder", "title", "aria-label", "alt"];

// Éléments qui forment une phrase, et éléments en ligne qu'une phrase peut contenir
const CONTENEURS_PHRASE = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "FIGCAPTION", "DT", "DD", "LABEL", "CAPTION", "TD", "TH"]);
const EN_LIGNE = new Set(["SPAN", "STRONG", "B", "EM", "I", "U", "S", "SMALL", "MARK", "SUP", "SUB", "ABBR", "TIME", "Q", "CITE", "DEL", "INS"]);

// ---------- État observable par React ----------

// Par défaut : FR / EN. La liste réelle vient de l'API (GET /traduction/langues).
let etat = { langue: LANGUE_SOURCE, langues: [LANGUE_SOURCE, "en"], active: false, occupe: false, erreur: null };
const abonnes = new Set();
const publier = (modif) => {
  etat = { ...etat, ...modif };
  abonnes.forEach((fn) => fn());
};

// ---------- Mémoire des textes d'origine ----------

const noeuds = new WeakMap(); // Text → { source, traduit }
const attributs = new WeakMap(); // Element → { [nom]: { source, traduit } }
const noeudsTraduits = new Set(); // pour pouvoir revenir au français
const elementsTraduits = new Set();

let apiUrl = "";
let cache = new Map(); // texte source (sans espaces autour) → traduction
let enAttente = new Set(); // textes à demander à l'API
let refuses = new Set(); // textes dont la traduction a échoué : pas redemandés avant le prochain changement de langue
let minuteur = null;
let generation = 0; // change à chaque changement de langue : invalide les réponses en retard
let observateur = null;

const traduisible = (texte) => /\p{L}/u.test(texte);
const ignore = (element) => !element || element.closest(A_IGNORER);

const stockage = {
  lire(cle) {
    try {
      return localStorage.getItem(cle);
    } catch {
      return null;
    }
  },
  ecrire(cle, valeur) {
    try {
      localStorage.setItem(cle, valeur);
    } catch {
      /* stockage plein ou indisponible : la traduction marche quand même */
    }
  },
};

function chargerCacheLocal(langue) {
  try {
    return new Map(Object.entries(JSON.parse(stockage.lire(CLE_CACHE(langue)) || "{}")));
  } catch {
    return new Map();
  }
}

function sauverCacheLocal(langue) {
  const entrees = [...cache.entries()].slice(-MAX_CACHE_LOCAL);
  stockage.ecrire(CLE_CACHE(langue), JSON.stringify(Object.fromEntries(entrees)));
}

// Remplace le texte en gardant les espaces d'origine autour
function habiller(original, traduction) {
  const debut = original.match(/^\s*/)[0];
  const fin = original.match(/\s*$/)[0];
  return debut + traduction + fin;
}

// ---------- Phrases découpées en plusieurs morceaux ----------

// Renvoie l'élément-phrase qui contient ce nœud, s'il est composé de plusieurs morceaux
// de texte séparés uniquement par des éléments en ligne neutres ; sinon null.
function phraseDe(noeud) {
  let el = noeud.parentElement;
  while (el && EN_LIGNE.has(el.tagName)) el = el.parentElement;
  if (!el || !CONTENEURS_PHRASE.has(el.tagName)) return null;
  const elements = el.getElementsByTagName("*");
  if (!elements.length) return null; // un seul morceau : traitement normal
  for (const enfant of elements) {
    if (!EN_LIGNE.has(enfant.tagName) || enfant.matches(A_IGNORER)) return null;
  }
  const remplis = morceaux(el).filter((n) => n.nodeValue.trim()).length;
  return remplis >= 2 ? el : null;
}

function morceaux(el) {
  const liste = [];
  const marcheur = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = marcheur.nextNode(); n; n = marcheur.nextNode()) liste.push(n);
  return liste;
}

// Met à jour la mémoire d'un nœud : renvoie son texte d'origine (français)
function suivre(noeud) {
  const valeur = noeud.nodeValue;
  let suivi = noeuds.get(noeud);
  if (suivi && valeur === suivi.traduit) return suivi;
  if (!suivi || valeur !== suivi.source) {
    suivi = { source: valeur, traduit: null };
    noeuds.set(noeud, suivi);
  }
  return suivi;
}

function traiterPhrase(el) {
  const liste = morceaux(el);
  const suivis = liste.map(suivre);
  const cle = suivis.map((s) => s.source).join("").replace(/\s+/g, " ").trim();
  if (!cle || !traduisible(cle)) return;
  if (!cache.has(cle)) {
    if (!refuses.has(cle)) enAttente.add(cle);
    return;
  }
  const traduction = cache.get(cle);
  const premier = suivis.findIndex((s) => s.source.trim());
  liste.forEach((noeud, i) => {
    const suivi = suivis[i];
    if (i === premier) suivi.traduit = habiller(suivi.source, traduction);
    else suivi.traduit = suivi.source.trim() ? "" : suivi.source; // morceau vidé, espaces gardés
    if (noeud.nodeValue !== suivi.traduit) noeud.nodeValue = suivi.traduit;
    noeudsTraduits.add(noeud);
  });
}

// ---------- Nœuds texte ----------

function traiterNoeud(noeud) {
  if (ignore(noeud.parentElement)) return;
  const phrase = phraseDe(noeud);
  if (phrase) {
    traiterPhrase(phrase);
    return;
  }
  const valeur = noeud.nodeValue;
  let suivi = noeuds.get(noeud);
  if (suivi && valeur === suivi.traduit) return; // c'est notre propre traduction
  if (!suivi || valeur !== suivi.source) {
    // Texte nouveau ou modifié par React : il devient le nouvel original
    suivi = { source: valeur, traduit: null };
    noeuds.set(noeud, suivi);
  }
  const cle = valeur.trim();
  if (!cle || !traduisible(cle) || ignore(noeud.parentElement)) return;
  if (cache.has(cle)) appliquerNoeud(noeud, suivi);
  else if (!refuses.has(cle)) enAttente.add(cle);
}

function appliquerNoeud(noeud, suivi) {
  const traduction = cache.get(suivi.source.trim());
  if (traduction === undefined) return;
  suivi.traduit = habiller(suivi.source, traduction);
  if (noeud.nodeValue !== suivi.traduit) noeud.nodeValue = suivi.traduit;
  noeudsTraduits.add(noeud);
}

// ---------- Attributs (placeholder, title, aria-label, alt) ----------

function traiterAttribut(element, nom) {
  const valeur = element.getAttribute(nom);
  if (valeur == null) return;
  const suivis = attributs.get(element) || {};
  let suivi = suivis[nom];
  if (suivi && valeur === suivi.traduit) return;
  if (!suivi || valeur !== suivi.source) {
    suivi = { source: valeur, traduit: null };
    suivis[nom] = suivi;
    attributs.set(element, suivis);
  }
  const cle = valeur.trim();
  if (!cle || !traduisible(cle)) return;
  if (cache.has(cle)) appliquerAttribut(element, nom, suivi);
  else if (!refuses.has(cle)) enAttente.add(cle);
}

function appliquerAttribut(element, nom, suivi) {
  const traduction = cache.get(suivi.source.trim());
  if (traduction === undefined) return;
  suivi.traduit = habiller(suivi.source, traduction);
  if (element.getAttribute(nom) !== suivi.traduit) element.setAttribute(nom, suivi.traduit);
  elementsTraduits.add(element);
}

// ---------- Parcours de la page ----------

function parcourir(racine) {
  if (racine.nodeType === Node.TEXT_NODE) {
    traiterNoeud(racine);
    return;
  }
  if (racine.nodeType !== Node.ELEMENT_NODE || ignore(racine)) return;

  const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
  for (let n = marcheur.nextNode(); n; n = marcheur.nextNode()) traiterNoeud(n);

  const selecteur = ATTRIBUTS.map((a) => `[${a}]`).join(",");
  const elements = [racine, ...racine.querySelectorAll(selecteur)];
  for (const el of elements) {
    if (el.nodeType !== Node.ELEMENT_NODE || ignore(el)) continue;
    for (const nom of ATTRIBUTS) if (el.hasAttribute(nom)) traiterAttribut(el, nom);
  }
}

// Réapplique les traductions reçues sur toute la page (rapide : tout est en cache)
function reappliquer() {
  parcourir(document.body);
  planifierEnvoi();
}

function planifierEnvoi() {
  if (!enAttente.size || minuteur) return;
  minuteur = setTimeout(envoyer, 60);
}

async function envoyer() {
  minuteur = null;
  const textes = [...enAttente].filter((t) => !cache.has(t));
  enAttente = new Set();
  if (!textes.length || etat.langue === LANGUE_SOURCE) return;

  // Découpage en lots acceptés par l'API
  const lots = [];
  let lot = [];
  let taille = 0;
  for (const t of textes) {
    if (t.length > 5000) continue; // trop long pour l'API : laissé en français
    if (lot.length >= LOT_TEXTES || taille + t.length > LOT_CARACTERES) {
      lots.push(lot);
      lot = [];
      taille = 0;
    }
    lot.push(t);
    taille += t.length;
  }
  if (lot.length) lots.push(lot);

  const maGeneration = generation;
  const langue = etat.langue;
  publier({ occupe: true });
  try {
    await Promise.all(
      lots.map(async (textesLot) => {
        const reponse = await fetch(`${apiUrl}/traduction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cible: langue, textes: textesLot }),
        });
        if (!reponse.ok) {
          const corps = await reponse.json().catch(() => null);
          throw new Error(typeof corps?.detail === "string" ? corps.detail : "Traduction indisponible");
        }
        const { traductions } = await reponse.json();
        if (maGeneration !== generation) return;
        textesLot.forEach((t, i) => cache.set(t, traductions[i]));
      }),
    );
    if (maGeneration !== generation) return;
    sauverCacheLocal(langue);
    publier({ occupe: false, erreur: null });
  } catch (e) {
    if (maGeneration !== generation) return;
    // TypeError = requête bloquée : API arrêtée, ou erreur 500 (ex. migration non appliquée)
    const raison =
      e instanceof TypeError
        ? "l'API ne répond pas ou a planté (migration `alembic upgrade head` appliquée ?)"
        : e.message || "erreur inconnue";
    console.warn(`[traduction] ${raison}`);
    publier({ occupe: false, erreur: messageIndisponible(raison) });
  }
  if (maGeneration === generation) {
    // Applique ce qui est arrivé (même partiellement) ; ce qui a échoué n'est pas redemandé
    textes.forEach((t) => !cache.has(t) && refuses.add(t));
    reappliquer();
  }
}

// ---------- Retour au français ----------

function restaurer() {
  for (const noeud of noeudsTraduits) {
    const suivi = noeuds.get(noeud);
    if (suivi && noeud.nodeValue === suivi.traduit) noeud.nodeValue = suivi.source;
    noeuds.delete(noeud);
  }
  for (const el of elementsTraduits) {
    const suivis = attributs.get(el) || {};
    for (const [nom, suivi] of Object.entries(suivis)) {
      if (el.getAttribute(nom) === suivi.traduit) el.setAttribute(nom, suivi.source);
    }
    attributs.delete(el);
  }
  noeudsTraduits.clear();
  elementsTraduits.clear();
}

// ---------- Observation des changements faits par React ----------

function surMutations(mutations) {
  if (etat.langue === LANGUE_SOURCE) return;
  for (const m of mutations) {
    if (m.type === "characterData") traiterNoeud(m.target);
    else if (m.type === "attributes") {
      if (!ignore(m.target)) traiterAttribut(m.target, m.attributeName);
    } else m.addedNodes.forEach(parcourir);
  }
  // Nettoyage : oublie les nœuds retirés de la page
  for (const n of noeudsTraduits) if (!n.isConnected) noeudsTraduits.delete(n);
  for (const el of elementsTraduits) if (!el.isConnected) elementsTraduits.delete(el);
  planifierEnvoi();
}

function demarrerObservation() {
  if (observateur) return;
  observateur = new MutationObserver(surMutations);
  observateur.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTS,
  });
}

function arreterObservation() {
  observateur?.disconnect();
  observateur = null;
}

// ---------- API publique ----------

export function changerLangue(langue) {
  if (!etat.langues.includes(langue)) langue = LANGUE_SOURCE;
  if (langue !== LANGUE_SOURCE && !etat.active) {
    reessayer(langue);
    return;
  }
  generation += 1;
  clearTimeout(minuteur);
  minuteur = null;
  enAttente = new Set();
  refuses = new Set();
  stockage.ecrire(CLE_LANGUE, langue);

  restaurer();
  document.documentElement.lang = langue;
  publier({ langue, erreur: null, occupe: false });

  if (langue === LANGUE_SOURCE) {
    arreterObservation();
    cache = new Map();
    return;
  }
  cache = chargerCacheLocal(langue);
  demarrerObservation();
  reappliquer();
}

// Langue de départ : choix enregistré, sinon langue du navigateur si elle est proposée
function langueInitiale(langues) {
  const enregistree = stockage.lire(CLE_LANGUE);
  if (enregistree && langues.includes(enregistree)) return enregistree;
  if (enregistree) return LANGUE_SOURCE;
  const navigateur = (navigator.languages || [navigator.language || ""]).map((l) => l.slice(0, 2).toLowerCase());
  if (navigateur[0] === LANGUE_SOURCE) return LANGUE_SOURCE;
  return navigateur.find((l) => langues.includes(l)) || LANGUE_SOURCE;
}

// Interroge l'API : quelles langues, et un service de traduction est-il configuré ?
// Renvoie { infos } ou { raison } (explication affichée en développement).
async function verifierService() {
  let reponse;
  try {
    reponse = await fetch(`${apiUrl}/traduction/langues`);
  } catch {
    return { raison: `API injoignable (${apiUrl}). Est-elle démarrée ?` };
  }
  if (reponse.status === 404) {
    return { raison: "La route /traduction n'existe pas : redémarrez l'API avec le nouveau code." };
  }
  if (!reponse.ok) return { raison: `L'API a répondu ${reponse.status}` };
  const infos = await reponse.json().catch(() => null);
  if (!infos?.active || !infos.cibles?.length) {
    return { raison: "Aucun service de traduction : ajoutez DEEPL_API_KEY dans le .env de l'API puis redémarrez-la." };
  }
  return { infos };
}

// Supprime du navigateur les traductions faites avec un ancien glossaire
function oublierAnciensCaches() {
  try {
    const actuelles = new Set(etat.langues.map(CLE_CACHE));
    Object.keys(localStorage)
      .filter((cle) => cle.startsWith("ie237-traductions-") && !actuelles.has(cle))
      .forEach((cle) => localStorage.removeItem(cle));
  } catch {
    /* stockage indisponible */
  }
}

function activer(infos) {
  versionGlossaire = infos.version || "";
  const langues = [LANGUE_SOURCE, ...infos.cibles.filter((l) => l !== LANGUE_SOURCE)];
  publier({ langues, active: true, erreur: null });
  oublierAnciensCaches();
  return langues;
}

// Message visible : détaillé en développement, simple pour les visiteurs
const messageIndisponible = (raison) =>
  import.meta.env.DEV ? `Traduction indisponible : ${raison}` : "Traduction indisponible pour le moment";

// Clic sur l'interrupteur alors que le service n'était pas prêt au chargement :
// on revérifie (l'API a pu redémarrer entre-temps) avant d'abandonner.
async function reessayer(langue) {
  publier({ occupe: true });
  const { infos, raison } = await verifierService();
  publier({ occupe: false });
  if (!infos) {
    console.warn(`[traduction] ${raison}`);
    publier({ erreur: messageIndisponible(raison) });
    return;
  }
  activer(infos);
  changerLangue(langue);
}

// À appeler une fois au démarrage, avec l'adresse de l'API
export async function initialiserTraduction(urlApi) {
  apiUrl = urlApi.replace(/\/$/, "");
  const { infos, raison } = await verifierService();
  if (!infos) {
    console.warn(`[traduction] ${raison}`);
    return; // l'interrupteur reste affiché ; un clic revérifiera
  }
  const langues = activer(infos);
  const depart = langueInitiale(langues);
  if (depart !== LANGUE_SOURCE) changerLangue(depart);
}

const sAbonner = (fn) => {
  abonnes.add(fn);
  return () => abonnes.delete(fn);
};
const lireEtat = () => etat;

// Bascule FR ⇄ première langue proposée (EN par défaut)
export function basculerLangue() {
  changerLangue(etat.langue === LANGUE_SOURCE ? etat.langues[1] || "en" : LANGUE_SOURCE);
}

// Pour les composants : { langue, langues, active, occupe, erreur }
export function useTraduction() {
  return useSyncExternalStore(sAbonner, lireEtat, lireEtat);
}
