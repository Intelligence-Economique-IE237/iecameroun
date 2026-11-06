"""Nettoyage du texte mis en forme (HTML) envoyé par l'éditeur du panneau admin.

Seules les balises de mise en forme sont gardées : un script ou un attribut
dangereux collé dans l'éditeur est retiré avant l'enregistrement.
"""
import nh3

BALISES = {
    "p", "br", "hr", "h2", "h3", "h4",
    "strong", "b", "em", "i", "u", "s",
    "ul", "ol", "li", "blockquote", "a", "code", "pre",
}
# Alignement (gauche, centré, droite, justifié) : seule la propriété CSS text-align est gardée
ALIGNABLES = {"p", "h2", "h3", "h4"}
ATTRIBUTS = {"a": {"href", "title", "target"}, **{balise: {"style"} for balise in ALIGNABLES}}


def nettoyer_html(html: str) -> str:
    return nh3.clean(
        html or "",
        tags=BALISES,
        attributes=ATTRIBUTS,
        url_schemes={"http", "https", "mailto"},
        link_rel="noopener noreferrer",
        filter_style_properties={"text-align"},
    ).strip()
