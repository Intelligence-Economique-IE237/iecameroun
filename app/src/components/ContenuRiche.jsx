import { useMemo } from "react";
import PropTypes from "prop-types";
import DOMPurify from "dompurify";

// Mise en forme autorisée (la même liste que l'API) : on nettoie aussi côté site
const CONFIG = {
  ALLOWED_TAGS: ["p", "br", "hr", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "a", "code", "pre"],
  ALLOWED_ATTR: ["href", "title", "target", "rel"],
};

const echapper = (texte) =>
  texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Anciens contenus en texte brut : une ligne vide sépare deux paragraphes
const versHtml = (texte) =>
  /<(p|h[2-4]|ul|ol|blockquote)\b/i.test(texte)
    ? texte
    : texte
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${echapper(p).replace(/\n/g, "<br>")}</p>`)
        .join("");

// Liens externes : nouvel onglet
DOMPurify.addHook("afterSanitizeAttributes", (noeud) => {
  if (noeud.tagName === "A" && /^https?:/i.test(noeud.getAttribute("href") || "")) {
    noeud.setAttribute("target", "_blank");
    noeud.setAttribute("rel", "noopener noreferrer");
  }
});

const ContenuRiche = ({ html, className = "" }) => {
  const propre = useMemo(() => DOMPurify.sanitize(versHtml(html || ""), CONFIG), [html]);
  if (!propre) return null;
  // eslint-disable-next-line react/no-danger -- HTML nettoyé par DOMPurify juste au-dessus
  return <div className={`texte-riche ${className}`} dangerouslySetInnerHTML={{ __html: propre }} />;
};

ContenuRiche.propTypes = { html: PropTypes.string, className: PropTypes.string };

export default ContenuRiche;
