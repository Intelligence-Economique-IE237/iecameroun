// Événements créés depuis le panneau admin : convertis au même format que
// les fiches écrites à la main (mopiet-2026.js) pour réutiliser les mêmes pages.
import { useMemo } from "react";
import { getEvenementsApi, urlFichier, useApi } from "../../api";
import { listeEvenements } from "./index";

const jourSemaine = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const jourMois = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", timeZone: "UTC" });
const complete = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const date = (iso) => new Date(`${iso}T00:00:00Z`);
const majuscule = (texte) => texte.charAt(0).toUpperCase() + texte.slice(1);

// « Du lundi 26 au vendredi 30 octobre 2026 », « Le mardi 10 février 2027 »…
export const periodeLongue = (debut, fin) => {
  const d = date(debut);
  const f = date(fin);
  if (debut === fin) return `Le ${complete.format(d)}`;
  const memeAnnee = d.getUTCFullYear() === f.getUTCFullYear();
  const memeMois = memeAnnee && d.getUTCMonth() === f.getUTCMonth();
  const premier = memeMois ? jourMois.format(d) : memeAnnee ? jourSemaine.format(d) : complete.format(d);
  return `Du ${premier} au ${complete.format(f)}`;
};

export const depuisApi = (e) => ({
  slug: e.slug,
  sigle: e.sigle,
  type: e.type,
  theme: e.theme,
  titre: e.titre,
  resume: e.resume,
  description: e.description,
  debut: e.debut,
  fin: e.fin,
  dates: periodeLongue(e.debut, e.fin),
  lieu: e.lieu,
  couverture: urlFichier(e.couverture),
  infos: e.infos.map((i) => ({ icon: "info", label: i.libelle, value: i.valeur })),
  document: e.document
      ? { href: urlFichier(e.document), label: e.document_libelle || "Télécharger le document (PDF)" }
      : null,
  jours: e.programme.map((j, i) => ({
    numero: i + 1,
    date: j.date || "",
    label: j.date ? majuscule(jourSemaine.format(date(j.date))) : `Jour ${i + 1}`,
    titre: j.titre || `Jour ${i + 1}`,
    programme: j.lignes.map((l) =>
        l.nature === "intertitre"
            ? { divider: l.activite }
            : { time: l.horaire, activity: l.activite, speaker: l.intervenant, kind: l.nature },
    ),
  })),
  galerie: e.photos.map((p) => ({
    src: urlFichier(p.chemin),
    fichier: p.chemin.split("/").pop(),
    legende: p.legende || undefined,
  })),
});

// Tous les événements : fiches du site + événements publiés depuis l'admin,
// du plus récent au plus ancien. Les fiches du site s'affichent tout de suite.
export const useListeEvenements = () => {
  const { donnees } = useApi(getEvenementsApi, "evenements");
  return useMemo(() => {
    const dejaLa = new Set(listeEvenements.map((e) => e.slug));
    const venusDeLApi = (donnees || []).filter((e) => !dejaLa.has(e.slug)).map(depuisApi);
    return [...listeEvenements, ...venusDeLApi].sort((a, b) => b.debut.localeCompare(a.debut));
  }, [donnees]);
};
