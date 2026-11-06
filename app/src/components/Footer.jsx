import { Link, useNavigate } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import { handleAnchorClick } from "../utils/scrollToSection";
import { CONTACT } from "./Header";
import { Conteneur } from "./ui";

// Pied de page vert profond : identité, contact, réseaux et plan du site
const colonnes = [
  {
    titre: "IE237",
    liens: [
      { label: "Qui sommes-nous", target: "a-propos" },
      { label: "Notre socle", target: "socle" },
      { label: "L'économie en chiffres", target: "economie" },
      { label: "Nous contacter", href: CONTACT },
    ],
  },
  {
    titre: "Nos offres",
    liens: [
      { label: "Veille & analyse", target: "offres-services" },
      { label: "Due diligence", target: "offres-services" },
      { label: "OSINT", target: "offres-services" },
      { label: "Influence & lobbying", target: "offres-services" },
      { label: "Formation", target: "offres-services" },
    ],
  },
  {
    titre: "Contenus",
    liens: [
      { label: "Publications", target: "publications" },
      { label: "Actualités", to: "/actualites" },
      { label: "Événements", to: "/evenements" },
    ],
  },
  {
    titre: "Découvrir",
    liens: [
      { label: "Nos partenaires", target: "partenaires" },
      { label: "Galerie", target: "galerie" },
      { label: "Chaîne WhatsApp", href: "https://whatsapp.com/channel/0029Vb6li0x5PO0xML0vdS27" },
    ],
  },
];

export const reseaux = [
  {
    nom: "LinkedIn",
    href: "https://www.linkedin.com/company/iecameroun/",
    d: "M4.98 3.5C4.98 4.6 4.1 5.5 3 5.5S1.02 4.6 1.02 3.5 1.9 1.5 3 1.5s1.98.9 1.98 2ZM1.5 8h3V22h-3V8Zm7 0h2.88v1.91h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59V22h-3v-7.18c0-1.71-.03-3.91-2.38-3.91-2.39 0-2.76 1.87-2.76 3.79V22h-3V8Z",
  },
  {
    nom: "X",
    href: "https://x.com/iecameroun",
    d: "M18.9 2H22l-6.77 7.74L23 22h-6.2l-4.86-6.35L6.4 22H3.3l7.24-8.28L1 2h6.35l4.39 5.79L18.9 2Zm-1.09 18h1.72L6.07 3.9H4.22L17.81 20Z",
  },
  {
    nom: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61579459257934",
    d: "M22 12A10 10 0 1 0 10.44 21.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z",
  },
  {
    nom: "TikTok",
    href: "https://www.tiktok.com/@iecameroun",
    d: "M16.6 5.82c-1.01-.98-1.57-2.32-1.57-3.82h-3.13v13.15c0 1.65-1.33 2.99-2.98 2.99a2.99 2.99 0 0 1-2.98-2.99 2.99 2.99 0 0 1 2.98-2.99c.28 0 .55.04.8.11V9.13a6.13 6.13 0 0 0-.8-.05 6.12 6.12 0 0 0-6.12 6.12A6.12 6.12 0 0 0 8.92 21.3a6.12 6.12 0 0 0 6.12-6.12V8.66a9.12 9.12 0 0 0 5.16 1.6V7.13a5.86 5.86 0 0 1-3.6-1.31Z",
  },
  {
    nom: "WhatsApp",
    href: "https://whatsapp.com/channel/0029Vb6li0x5PO0xML0vdS27",
    d: "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.35a9.87 9.87 0 0 0 4.62 1.15h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2Zm5.8 14.13c-.24.68-1.42 1.3-1.96 1.35-.5.05-1.14.07-1.84-.12-.42-.12-.96-.3-1.66-.6-2.92-1.26-4.83-4.2-4.98-4.4-.15-.2-1.19-1.58-1.19-3.02 0-1.44.75-2.14 1.02-2.44.27-.29.58-.36.77-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.82 1.98.89 2.12.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.5-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.38-.24.64-.15.26.1 1.65.78 1.94.92.28.15.47.22.54.34.07.13.07.72-.17 1.4Z",
  },
];

const CLASSE_LIEN = "text-[13px] text-white/65 no-underline transition-colors hover:text-white";

const Footer = () => {
  const navigate = useNavigate();

  const lien = (l) => {
    if (l.to) return <Link to={l.to} className={CLASSE_LIEN}>{l.label}</Link>;
    if (l.target) {
      return (
          <a href={`/#${l.target}`} onClick={(e) => handleAnchorClick(e, l.target, navigate)} className={CLASSE_LIEN}>
            {l.label}
          </a>
      );
    }
    const externe = l.href.startsWith("http");
    return (
        <a href={l.href} className={CLASSE_LIEN} {...(externe && { target: "_blank", rel: "noreferrer" })}>
          {l.label}
        </a>
    );
  };

  return (
      <footer className="bg-primary text-white">

        <Conteneur className="pt-16">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_2.65fr]">
            {/* Bloc identité */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="grid h-20 w-20 place-items-center rounded-lg bg-white">
                  <img src="/logo-ie237.svg" alt="" className="h-auto w-auto" />
                </span>
                <p className="m-0 text-[15px] font-bold leading-tight">
                  IE237
                  <span className="block text-[13px] font-medium text-white/65">Intelligence Économique 237</span>
                </p>
              </div>
              <p className="m-0 max-w-sm text-[13px] leading-[1.7] text-white/65">
                Un Think-Do Tank républicain : veille, influence et protection au service des décideurs publics et
                privés du Cameroun.
              </p>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[13px] text-white/80">
                <li className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-tertiary" aria-hidden="true" />
                  Bastos, Yaoundé, Cameroun
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-tertiary" aria-hidden="true" />
                  <a href={CONTACT} className="text-white/80 no-underline hover:text-white">contact@iecameroun.cm</a>
                </li>
              </ul>
              <div>
                <p className="m-0 mb-3 text-[13px] text-white/60">Retrouvez-nous sur les réseaux</p>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {reseaux.map((r) => (
                      <li key={r.nom}>
                        <a
                            href={r.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={r.nom}
                            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-tertiary hover:text-heading"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                            <path d={r.d} />
                          </svg>
                        </a>
                      </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Colonnes de liens */}
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
              {colonnes.map((c) => (
                  <div key={c.titre}>
                    <p className="m-0 mb-5 flex items-center gap-2 text-[14px] font-semibold text-white">
                      {c.titre}
                    </p>
                    <ul className="m-0 flex list-none flex-col gap-3 p-0">
                      {c.liens.map((l) => (
                          <li key={l.label}>{lien(l)}</li>
                      ))}
                    </ul>
                  </div>
              ))}
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-white/10 py-6 text-[12px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} IE237 : Intelligence Économique 237. Tous droits réservés.</span>
            <nav aria-label="Informations légales" className=" items-center gap-x-5 gap-y-1 hidden">
              <Link to="/mentions-legales" className="text-white/55 no-underline hover:text-white">Mentions légales</Link>
              <Link to="/politique-de-confidentialite" className="text-white/55 no-underline hover:text-white">
                Politique de confidentialité
              </Link>
            </nav>
          </div>
        </Conteneur>
      </footer>
  );
};

export default Footer;
