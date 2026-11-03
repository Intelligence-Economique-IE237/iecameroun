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
};

export const initiales = (nom, email) =>
  (nom || email || "?")
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0].toUpperCase())
    .join("");
