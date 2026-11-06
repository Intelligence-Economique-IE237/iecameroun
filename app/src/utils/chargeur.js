// Masque l'écran de chargement (défini dans index.html) une fois la page prête :
// page chargée + polices prêtes, affiché au moins DUREE_MIN pour éviter un flash,
// et jamais plus de DUREE_MAX même si une ressource traîne.
const DUREE_MIN = 700;
const DUREE_MAX = 4000;

export function masquerChargeur() {
  const chargeur = document.getElementById("ie-chargeur");
  if (!chargeur) return;

  const debut = performance.now();
  let fait = false;

  const fermer = () => {
    if (fait) return;
    fait = true;
    const attente = Math.max(0, DUREE_MIN - (performance.now() - debut));
    setTimeout(() => {
      chargeur.classList.add("ie-chargeur--fini");
      setTimeout(() => chargeur.remove(), 500);
    }, attente);
  };

  const pageChargee =
      document.readyState === "complete"
          ? Promise.resolve()
          : new Promise((ok) => window.addEventListener("load", ok, { once: true }));
  const policesPretes = document.fonts?.ready ?? Promise.resolve();

  Promise.all([pageChargee, policesPretes]).then(fermer, fermer);
  setTimeout(fermer, DUREE_MAX);
}
