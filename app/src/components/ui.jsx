// Briques de mise en page communes à tout le site (style sobre : typographie, filets, espace)
import PropTypes from "prop-types";
import RevealOnScroll from "./RevealOnScroll";

// Largeur de lecture commune
export const Conteneur = ({ className = "", children }) => (
    <div className={`mx-auto w-full max-w-[1080px] px-5 sm:px-8 ${className}`}>{children}</div>
);

// Section séparée de la précédente par un filet fin
export const Section = ({ id, className = "", children }) => (
    <section id={id} className={`scroll-mt-20 border-t border-border py-16 sm:py-24 ${className}`}>
      <Conteneur>{children}</Conteneur>
    </section>
);

// Petit trait d'accent posé au-dessus des titres
export const TraitAccent = ({ className = "" }) => (
    <span aria-hidden="true" className={`mb-4 block h-[3px] w-10 rounded-full bg-primary ${className}`} />
);

// Titre de section + phrase d'explication (centre = titre centré, pour les grilles de cartes)
export const EnteteSection = ({ titre, texte, action, centre = false, className = "" }) => (
    <RevealOnScroll
        className={`mb-10 flex flex-col gap-4 ${centre ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"} ${className}`}
    >
      <div className={`max-w-2xl ${centre ? "flex flex-col items-center" : ""}`}>
        <TraitAccent />
        <h2 className="m-0 text-[30px] sm:text-[38px] font-bold leading-[1.15] tracking-[-0.02em] text-heading">{titre}</h2>
        {texte && <p className="m-0 mt-3 text-[15px] leading-6 text-body">{texte}</p>}
      </div>
      {action}
    </RevealOnScroll>
);

// Petite étiquette en capitales (ex. « PILIER », « ÉTUDE »)
export const Etiquette = ({ className = "", children }) => (
    <span className={`text-[12px] font-medium uppercase tracking-[0.08em] text-muted ${className}`}>{children}</span>
);

// Intertitre centré entre deux filets
export const IntertitreCentre = ({ children }) => (
    <div className="mb-10 flex items-center justify-center gap-4">
      <span className="h-px w-10 bg-border" />
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</span>
      <span className="h-px w-10 bg-border" />
    </div>
);

// Carte blanche à bordure fine
export const Carte = ({ className = "", children }) => (
    <div
        className={`rounded-lg border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-heading/30 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.12)] ${className}`}
    >
      {children}
    </div>
);

const BOUTONS = {
  primaire: "bg-primary text-white hover:bg-primary-hover",
  secondaire: "border border-border bg-surface text-heading hover:border-heading",
};

// Classes d'un bouton (utilisables sur <a>, <Link> ou <button>)
export const classeBouton = (variante = "primaire") =>
    `inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-[15px] font-semibold no-underline transition duration-200 cursor-pointer active:scale-[0.98] ${BOUTONS[variante]}`;

// Couleur d'accent IE237 (traits, pastilles) : le vert seul
export const ACCENTS = ["bg-primary"];

// Pastille devant le type de document
export const couleurType = () => "bg-primary";

const enfants = PropTypes.node;
Conteneur.propTypes = { className: PropTypes.string, children: enfants };
Section.propTypes = { id: PropTypes.string, className: PropTypes.string, children: enfants };
EnteteSection.propTypes = { titre: enfants.isRequired, texte: enfants, action: enfants, centre: PropTypes.bool, className: PropTypes.string };
TraitAccent.propTypes = { className: PropTypes.string };
Etiquette.propTypes = { className: PropTypes.string, children: enfants };
IntertitreCentre.propTypes = { children: enfants };
Carte.propTypes = { className: PropTypes.string, children: enfants };
