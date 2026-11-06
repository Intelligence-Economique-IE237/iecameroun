// Met à jour les repères économiques de l'accueil :
//  - indicateurs macroéconomiques : API publique du FMI (DataMapper, World Economic Outlook) ;
//  - cours du cacao : Banque mondiale, « Pink Sheet » mensuel (fichier Excel publié chaque mois).
// À relancer après chaque nouvelle édition du World Economic Outlook (avril et octobre) :
//   npm run maj:economie
// puis vérifier src/data/economie.js et commiter.
import { writeFile } from "node:fs/promises";
import { readSheet } from "read-excel-file/node";

const PAYS = "CMR";
const PREMIERE_ANNEE = 2012;
const DERNIERE_ANNEE = 2030;
// Première année projetée par le FMI (les années suivantes sont des projections)
const DEBUT_PROJECTIONS = Number(process.env.DEBUT_PROJECTIONS ?? new Date().getFullYear());

const INDICATEURS = [
  { cle: "croissance", code: "NGDP_RPCH", libelle: "Croissance du PIB réel", unite: "%", decimales: 1 },
  { cle: "inflation", code: "PCPIPCH", libelle: "Inflation", unite: "%", decimales: 1 },
  { cle: "dette", code: "GGXWDG_NGDP", libelle: "Dette publique", unite: "% du PIB", decimales: 1 },
  { cle: "pib", code: "NGDPD", libelle: "PIB nominal", unite: "Md USD", decimales: 1 },
];

const lire = async (url) => {
  // Le FMI refuse les requêtes sans en-tête User-Agent explicite
  const reponse = await fetch(url, { headers: { "User-Agent": "ie237-site/maj-economie", Accept: "application/json" } });
  if (!reponse.ok) throw new Error(`${url} → HTTP ${reponse.status}`);
  return reponse.json();
};

const meta = await lire("https://www.imf.org/external/datamapper/api/v1/indicators");
const edition = meta.indicators[INDICATEURS[0].code]?.source ?? "World Economic Outlook";
// « World Economic Outlook (October 2026) » → « Perspectives de l'économie mondiale, octobre 2026 »
const MOIS = { April: "avril", October: "octobre", January: "janvier", July: "juillet" };
const [, moisEn, an] = edition.match(/\((\w+) (\d{4})\)/) ?? [];
const editionFr = moisEn ? `Perspectives de l'économie mondiale, ${MOIS[moisEn] ?? moisEn} ${an}` : edition;

const series = [];
for (const ind of INDICATEURS) {
  const donnees = await lire(`https://www.imf.org/external/datamapper/api/v1/${ind.code}/${PAYS}`);
  const valeurs = donnees.values?.[ind.code]?.[PAYS];
  if (!valeurs) throw new Error(`Aucune donnée ${ind.code} pour ${PAYS}`);
  const serie = [];
  for (let annee = PREMIERE_ANNEE; annee <= DERNIERE_ANNEE; annee += 1) {
    const v = valeurs[String(annee)];
    if (typeof v === "number") serie.push([annee, Math.round(v * 10) / 10]);
  }
  series.push({ ...ind, serie });
}

// ---------- Cacao : Banque mondiale, Pink Sheet mensuel ----------
const PAGE_BM = "https://www.worldbank.org/en/research/commodity-markets";
const DEBUT_CACAO = "2019M01";

const page = await (await fetch(PAGE_BM, { headers: { "User-Agent": "ie237-site/maj-economie" } })).text();
const urlMensuel = page.match(/https:\/\/thedocs\.worldbank\.org\/[^"']*CMO-Historical-Data-Monthly\.xlsx/)?.[0];
if (!urlMensuel) throw new Error("Lien du Pink Sheet mensuel introuvable sur " + PAGE_BM);
const fichier = Buffer.from(await (await fetch(urlMensuel, { headers: { "User-Agent": "ie237-site/maj-economie" } })).arrayBuffer());
const lignes = await readSheet(fichier, "Monthly Prices");
const enTetes = lignes.find((l) => l.includes("Cocoa"));
const colonne = enTetes.indexOf("Cocoa");
const miseAJourBm = lignes.flat().find((c) => typeof c === "string" && c.startsWith("Updated on")) ?? "";
const mois = lignes
    .filter((l) => typeof l[0] === "string" && /^\d{4}M\d{2}$/.test(l[0]) && l[0] >= DEBUT_CACAO && typeof l[colonne] === "number")
    .map((l) => [l[0].replace("M", "-"), Math.round(l[colonne] * 100) / 100]);
if (mois.length < 12) throw new Error("Série du cacao incomplète");
// « Updated on November 03, 2026 » → « 3 novembre 2026 »
const dateBm = new Date(miseAJourBm.replace("Updated on", "").trim());
const dateBmFr = Number.isNaN(dateBm.getTime())
    ? ""
    : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(dateBm);

const contenu = `// Fichier généré par scripts/maj-economie.mjs — ne pas modifier à la main.
// Source : FMI, DataMapper, ${edition}. Extrait le ${new Date().toISOString().slice(0, 10)}.

export const sourceEconomie = {
  libelle: ${JSON.stringify(`FMI, ${editionFr}`)},
  url: "https://www.imf.org/external/datamapper/profile/${PAYS}",
  debutProjections: ${DEBUT_PROJECTIONS},
};

// serie : [année, valeur]
export const indicateursEconomie = ${JSON.stringify(series, null, 2)};

// Cours mondial du cacao, moyenne mensuelle (Banque mondiale, Pink Sheet). serie : ["AAAA-MM", USD/kg]
export const cacao = {
  libelle: "Cours mondial du cacao",
  unite: "USD/kg",
  decimales: 2,
  source: ${JSON.stringify(`Banque mondiale, Pink Sheet${dateBmFr ? ` (mis à jour le ${dateBmFr})` : ""}`)},
  url: "https://www.worldbank.org/en/research/commodity-markets",
  serie: ${JSON.stringify(mois)},
};
`;

await writeFile(new URL("../src/data/economie.js", import.meta.url), contenu);
console.log(`src/data/economie.js mis à jour (${edition}, projections dès ${DEBUT_PROJECTIONS} ; cacao jusqu'à ${mois.at(-1)[0]}).`);
