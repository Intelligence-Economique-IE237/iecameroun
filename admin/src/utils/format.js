const formatDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Douala",
});

export const dateCourte = (iso) => (iso ? formatDate.format(new Date(iso)) : "—");

export const ROLES = {
  admin: "Admin",
  editeur: "Éditeur",
  analyste: "Analyste",
};

// Circuit de validation des actualités
export const STATUTS = {
  brouillon: { libelle: "Brouillon", ton: "gris" },
  soumis: { libelle: "À valider", ton: "jaune" },
  a_corriger: { libelle: "À corriger", ton: "rouge" },
  valide: { libelle: "Validé", ton: "bleu" },
  publie: { libelle: "Publié", ton: "vert" },
};

export const nombre = (n) => new Intl.NumberFormat("fr-FR").format(n ?? 0);

export const initiales = (nom, email) =>
  (nom || email || "?")
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0].toUpperCase())
    .join("");

// Dates d'événement « AAAA-MM-JJ » → « 10 – 11 févr. 2027 »
const jourMois = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const dateSeule = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const periode = (debut, fin) => {
  if (!debut) return "—";
  const d = new Date(`${debut}T00:00:00Z`);
  const f = new Date(`${fin || debut}T00:00:00Z`);
  if (debut === fin || !fin) return dateSeule.format(d);
  if (d.getUTCFullYear() === f.getUTCFullYear()) return `${jourMois.format(d)} – ${dateSeule.format(f)}`;
  return `${dateSeule.format(d)} – ${dateSeule.format(f)}`;
};
