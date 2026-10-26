import PropTypes from "prop-types";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/#a-propos" },
  { label: "Nos Offres de Services", href: "/#offres-services" },
  { label: "Publications", href: "/publications" },
];

const Footer = ({ className = "" }) => {
  const onLinkClick = useCallback(() => {
    window.open("mailto:contact@iecameroun.cm");
  }, []);

  return (
      <footer
          className={`relative w-full bg-background py-16 sm:py-24 lg:py-32 px-6 sm:px-10 lg:px-8 font-[Outfit] ${className}`}
      >
        <div className="max-w-[1336px] mx-auto flex flex-col items-center gap-14">

          {/* CTA */}
          <div className="w-full max-w-5xl rounded-3xl bg-primary px-8 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                Échangeons sur vos enjeux en intelligence économique.
              </p>
            </div>

            <button
                onClick={onLinkClick}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-primary hover:bg-primary-bg transition-colors duration-300 shadow-sm"
            >
              Contactez-nous
            </button>
          </div>

          {/* Footer */}
          <div className="w-full flex flex-col gap-10">

            {/* Top */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

              {/* Logo */}
              <img
                  src="/logo-ie237.svg"
                  alt="IE237"
                  className="h-24 w-auto object-contain"
              />

              {/* Navigation */}
              <nav className="hidden lg:flex items-center gap-10 text-body font-[Poppins]">
                {navItems.map((item) => {
                  const isAnchor = item.href.includes("#");

                  if (isAnchor) {
                    return (
                        <HashLink
                            key={item.href}
                            smooth
                            to={item.href}
                            className="no-underline"
                        >
                  <span className="transition-colors duration-300 hover:text-primary">
                    {item.label}
                  </span>
                        </HashLink>
                    );
                  }

                  return (
                      <Link
                          key={item.href}
                          to={item.href}
                          className="no-underline transition-colors duration-300 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                  );
                })}
              </nav>
              

              {/* Réseaux sociaux */}
              <div className="flex items-center gap-4">

                <a
                    href="https://www.facebook.com/profile.php?id=61579459257934"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="text-body hover:text-primary transition-colors duration-300"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                  >
                    <path d="M22 12A10 10 0 1 0 10.44 21.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                    href="https://www.linkedin.com/company/iecameroun/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-body hover:text-primary transition-colors duration-300"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                  >
                    <path d="M4.98 3.5C4.98 4.6 4.1 5.5 3 5.5S1.02 4.6 1.02 3.5 1.9 1.5 3 1.5s1.98.9 1.98 2ZM1.5 8h3V22h-3V8Zm7 0h2.88v1.91h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59V22h-3v-7.18c0-1.71-.03-3.91-2.38-3.91-2.39 0-2.76 1.87-2.76 3.79V22h-3V8Z"/>
                  </svg>
                </a>
                {/* X */}
                <a
                    href="https://x.com/iecameroun"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X"
                    className="text-body hover:text-primary transition-colors duration-300"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                  >
                    <path d="M18.9 2H22l-6.77 7.74L23 22h-6.2l-4.86-6.35L6.4 22H3.3l7.24-8.28L1 2h6.35l4.39 5.79L18.9 2Zm-1.09 18h1.72L6.07 3.9H4.22L17.81 20Z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a
                    href="https://www.tiktok.com/@iecameroun"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="text-body hover:text-primary transition-colors duration-300"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                  >
                    <path d="M16.6 5.82c-1.01-.98-1.57-2.32-1.57-3.82h-3.13v13.15c0 1.65-1.33 2.99-2.98 2.99a2.99 2.99 0 0 1-2.98-2.99 2.99 2.99 0 0 1 2.98-2.99c.28 0 .55.04.8.11V9.13a6.13 6.13 0 0 0-.8-.05 6.12 6.12 0 0 0-6.12 6.12A6.12 6.12 0 0 0 8.92 21.3a6.12 6.12 0 0 0 6.12-6.12V8.66a9.12 9.12 0 0 0 5.16 1.6V7.13a5.86 5.86 0 0 1-3.6-1.31Z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a
                    href="https://whatsapp.com/channel/0029Vb6li0x5PO0xML0vdS27"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="text-body hover:text-primary transition-colors duration-300"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                  >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.35a9.87 9.87 0 0 0 4.62 1.15h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2Zm5.8 14.13c-.24.68-1.42 1.3-1.96 1.35-.5.05-1.14.07-1.84-.12-.42-.12-.96-.3-1.66-.6-2.92-1.26-4.83-4.2-4.98-4.4-.15-.2-1.19-1.58-1.19-3.02 0-1.44.75-2.14 1.02-2.44.27-.29.58-.36.77-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.82 1.98.89 2.12.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.5-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.38-.24.64-.15.26.1 1.65.78 1.94.92.28.15.47.22.54.34.07.13.07.72-.17 1.4Z"/>
                  </svg>
                </a>

              </div>
            </div>

            {/* Ligne */}
            <div className="border-t border-border" />

            {/* Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-body font-[Inter]">

              <p>
                © 2026 IE237. Tous droits réservés.
              </p>

              <p className="font-medium text-heading">
                Veille • Influence • Protection
              </p>

            </div>

          </div>
        </div>
      </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;