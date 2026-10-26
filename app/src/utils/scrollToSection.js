/**
 * Défile en douceur jusqu'à une section de la page, en tenant compte
 * de la hauteur de la barre de navigation fixe, sans modifier l'URL.
 *
 * @param {string} [id] identifiant de la section ; vide = haut de page
 */
export function scrollToSection(id) {
  const top = id ? getSectionTop(id) : 0;
  if (top === null) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
}

function getSectionTop(id) {
  const target = document.getElementById(id);
  if (!target) return null;

  const nav = document.querySelector("[data-site-nav]");
  const offset = (nav?.offsetHeight ?? 0) + 16;

  return target.getBoundingClientRect().top + window.scrollY - offset;
}

/**
 * Gestionnaire de clic pour un lien vers une section de l'accueil.
 * - Sur l'accueil : défile vers la section sans « #id » dans l'URL.
 * - Sur une autre page : retourne à l'accueil, qui défile ensuite vers
 *   la section (voir PageContainer).
 *
 * @param {MouseEvent} event
 * @param {string} id identifiant de la section ; vide = haut de page
 * @param {Function} navigate fonction renvoyée par useNavigate()
 */
export function handleAnchorClick(event, id, navigate) {
  // Laisse le navigateur gérer Ctrl/Cmd/Maj + clic et le clic molette
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
  event.preventDefault();

  if (window.location.pathname === "/") {
    scrollToSection(id);
  } else {
    navigate(id ? `/#${id}` : "/");
  }
}