import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { handleAnchorClick } from "../utils/scrollToSection";
import { classeBouton } from "./ui";

// target = section de l'accueil, to = page
export const navItems = [
  { label: "À propos", target: "a-propos" },
  { label: "Nos offres", target: "offres-services" },
  { label: "Publications", target: "publications" },
  { label: "Actualités", to: "/actualites" },
  { label: "Événements", to: "/evenements" },
  { label: "Galerie", target: "galerie" },
];

export const CONTACT = "mailto:contact@iecameroun.cm";

const Header = ({ className = "" }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const [defile, setDefile] = useState(false);

  useEffect(() => {
    const surDefilement = () => setDefile(window.scrollY > 8);
    surDefilement();
    window.addEventListener("scroll", surDefilement, { passive: true });
    return () => window.removeEventListener("scroll", surDefilement);
  }, []);

  const lien = (item, classe, onNavigate) =>
      item.to ? (
          <Link key={item.label} to={item.to} onClick={onNavigate} className={classe}>
            {item.label}
          </Link>
      ) : (
          <a
              key={item.label}
              href={`/#${item.target}`}
              onClick={(e) => {
                onNavigate?.();
                handleAnchorClick(e, item.target, navigate);
              }}
              className={classe}
          >
            {item.label}
          </a>
      );

  return (
      <header className={`relative w-full ${className}`}>
        <nav data-site-nav className={`fixed inset-x-0 top-0 z-50 border-b bg-surface transition-shadow duration-300 ${defile ? "border-border shadow-[0_6px_24px_-12px_rgba(0,0,0,0.15)]" : "border-transparent"}`}>
          <div className="mx-auto flex h-[64px] w-full max-w-[1180px] items-center justify-between gap-6 px-5 sm:px-8">
            <Link to="/" className="flex shrink-0 items-center gap-2.5 no-underline" aria-label="IE237, accueil">
              <img src="/logo-ie237.svg" alt="" className="h-10 w-10" />
              <span className="flex flex-col leading-tight">
                <span className="text-[18px] font-bold tracking-[-0.01em] text-heading">IE237</span>
              </span>
            </Link>

            <div className="hidden items-center gap-7 lg:flex">
              {navItems.map((item) =>
                  lien(item, "relative text-[15px] text-body no-underline transition-colors hover:text-heading after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-heading after:transition-transform after:duration-300 hover:after:scale-x-100"),
              )}
            </div>

            <div className="hidden lg:block">
              <a href={CONTACT} className={`${classeBouton()} !py-2`}>
                Nous contacter
              </a>
            </div>

            <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-transparent text-heading lg:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>


          {/* Menu mobile */}
          {menuOpen && (
              <div className="border-t border-border bg-surface lg:hidden">
                <div className="mx-auto flex max-w-[1180px] flex-col px-5 py-2 sm:px-8">
                  {navItems.map((item) =>
                      lien(item, "border-b border-border py-3.5 text-base text-heading no-underline last:border-none", closeMenu),
                  )}
                  <a href={CONTACT} className={`${classeBouton()} my-4`}>
                    Nous contacter
                  </a>
                </div>
              </div>
          )}
        </nav>

        {/* Espace réservé à la barre fixe */}
        <div className="h-[64px]" />
      </header>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  hero: PropTypes.bool, // conservé pour compatibilité : l'ouverture de l'accueil est désormais dans la page
};

export default Header;
