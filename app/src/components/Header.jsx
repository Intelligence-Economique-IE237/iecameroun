import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Compass, Menu, X, ArrowUpRight } from "lucide-react";
import { handleAnchorClick } from "../utils/scrollToSection";

// target vide = haut de page
const navItems = [
  { label: "Accueil", target: "" },
  { label: "À propos", target: "a-propos" },
  { label: "Nos Offres de Services", target: "offres-services" },
  { label: "Publications", target: "publications" },
  { label: "Galerie", target: "galerie" },
  { label: "MOPIET 2026", to: "/mopiet-2026" },
];

const Header = ({ className = "", hero = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Lien vers une page (to) ou vers une section de l'accueil (target)
  const renderNavItem = (item, children, onNavigate) =>
      item.to ? (
          <Link key={item.label} to={item.to} onClick={onNavigate} className="no-underline">
            {children}
          </Link>
      ) : (
          <a
              key={item.label}
              href={item.target ? `/#${item.target}` : "/"}
              onClick={(e) => {
                onNavigate?.();
                handleAnchorClick(e, item.target, navigate);
              }}
              className="no-underline"
          >
            {children}
          </a>
      );

  const onLinkClick = useCallback(() => {
    setMenuOpen(false);
    window.open("mailto:contact@iecameroun.cm");
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
      <header className={`relative w-full bg-background ${className}`}>
        <nav data-site-nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm shadow-sm">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-12 py-3 text-heading font-[Poppins]">
            <h2 className="m-0 text-base sm:text-lg lg:text-xl font-semibold shrink-0">
              Intelligence Economique | IE237
            </h2>

            <button
                type="button"
                className="lg:hidden shrink-0 flex items-center justify-center h-10 w-10 rounded-full border-none bg-surface-alt text-heading cursor-pointer transition-colors duration-250 hover:text-primary"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="hidden lg:flex items-center gap-5 xl:gap-8 2xl:gap-12 text-sm xl:text-base font-medium text-heading">
              {navItems.map((item) =>
                  renderNavItem(
                      item,
                      <span className="whitespace-nowrap transition-colors hover:text-primary">{item.label}</span>,
                  ),
              )}
            </div>

            <button
                type="button"
                className="hidden lg:flex h-9 cursor-pointer border-none px-5 py-2.5 bg-primary hover:bg-primary-hover transition-colors duration-250 rounded-[10px] items-center gap-2 shrink-0"
                onClick={onLinkClick}
            >
            <span className="text-[12px] leading-6 font-[Poppins] text-background">
              Contactez-nous
            </span>
              <ArrowUpRight className="h-4 w-4 text-background" />
            </button>
          </div>

          {/* Menu mobile */}
          <div
              className={`lg:hidden absolute left-0 right-0 top-full origin-top transition-all duration-300 ${
                  menuOpen
                      ? "max-h-[calc(100dvh-76px)] overflow-y-auto overscroll-contain opacity-100"
                      : "max-h-0 overflow-hidden opacity-0 pointer-events-none"
              }`}
          >
            <div className="mx-5 sm:mx-8 mt-2 mb-4 rounded-2xl border border-border bg-surface shadow-lg flex flex-col divide-y divide-border">
              {navItems.map((item) =>
                  renderNavItem(
                      item,
                      <span className="block px-5 py-4 text-base font-medium text-heading transition-colors hover:text-primary">
                        {item.label}
                      </span>,
                      closeMenu,
                  ),
              )}
              <button
                  type="button"
                  className="flex items-center justify-center gap-2 m-4 cursor-pointer border-none px-5 py-3 bg-primary hover:bg-primary-hover transition-colors duration-250 rounded-[10px]"
                  onClick={onLinkClick}
              >
              <span className="text-[12px] leading-6 font-[Poppins] text-background">
                Contactez-nous
              </span>
                <ArrowUpRight className="h-4 w-4 text-background" />
              </button>
            </div>
          </div>
        </nav>

        {/* Espaceur pour compenser la navbar fixe */}
        <div className="h-[60px] sm:h-[68px]" />

        {hero && (
        <>
        <div
            className="relative max-w-[1440px] mx-auto bg-surface px-5 sm:px-8 lg:px-12 pt-6 pb-10 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20"
            id="accueil"
        >
          <img
              className="absolute left-0 top-0 -z-10 w-48 sm:w-72 lg:w-[520px] opacity-50 pointer-events-none"
              alt=""
              src="/Ellipse-737.svg"
          />

          <section className="relative flex flex-col items-start gap-4 py-10 sm:py-16 lg:py-24 text-left font-[Poppins]">
            <style>{`
            @keyframes highlightSweep {
              from { transform: scaleX(0); }
              to { transform: scaleX(1); }
            }
            .highlight-mark {
              animation: highlightSweep 0.7s ease-out forwards;
              transform-origin: left center;
            }
          `}</style>

            <div className="h-[39px] rounded-[42px] bg-primary flex items-center justify-center px-5">
              <h3 className="m-0 font-medium text-sm sm:text-base text-surface">IE237</h3>
            </div>

            <h2 className="m-0 max-w-xl lg:max-w-2xl text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-heading">
              <b>{`Un `}</b>
              <span className="relative inline-block">
              <span
                  className="highlight-mark absolute z-0 left-[-6px] right-[-6px] bottom-[6%] top-[45%] bg-primary-soft rounded-sm"
                  style={{ animationDelay: "0.4s" }}
              />
              <span className="relative font-medium text-primary-hover">Think Do tank</span>
            </span>
              <br />
              <span className="relative inline-block">
              <span
                  className="highlight-mark absolute z-0 left-[-6px] right-[-6px] bottom-[6%] top-[45%] bg-primary-soft rounded-sm"
                  style={{ animationDelay: "0.9s" }}
              />
              <span className="relative text-primary-hover font-medium">républicain{" "}</span>
            </span>{" "}
              <b>
                au service
                <br />
                du developpement économique et de la souveraineté nationale
              </b>
            </h2>

            <div className="mt-6 lg:mt-10 w-full">
              <div className="w-full flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border gap-6 sm:gap-0 text-heading">
                {/* Siège */}
                <div className="flex flex-col gap-2 pb-6 sm:pb-0 sm:pr-14">
                  <h2 className="m-0 text-sm sm:text-xs lg:text-lg font-bold">Notre siège</h2>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-muted">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <span>Bastos - Yaoundé, Cameroun</span>
                  </div>
                </div>

                {/* Socle */}
                <div className="flex flex-col gap-2 pt-6 sm:pt-0 sm:pl-14">
                  <h2 className="m-0 text-sm sm:text-xs lg:text-lg font-bold">Notre socle</h2>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-muted">
                    <Compass className="h-5 w-5 text-primary shrink-0" />
                    <span>Veille - Innovation - Influence - Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="relative w-full mt-10 lg:absolute lg:right-0 lg:top-44 lg:w-[45%] z-0 lg:h-[500px] mx-auto block px-6 lg:px-0">
          <div className="relative rounded-2xl overflow-hidden">
            <img
                className="w-full h-auto object-contain rounded-2xl"
                alt=""
                src="/logo-ie237.svg"
            />
          </div>
        </div>
        </>
        )}
      </header>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  hero: PropTypes.bool,
};

export default Header;