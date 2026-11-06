import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Conteneur, classeBouton } from "../ui";
import { handleAnchorClick } from "../../utils/scrollToSection";
import useCompteur from "../../utils/useCompteur";
import { images, stats } from "../../data/contenu";

const DUREE_DIAPO = 6000;
const diapos = images.diaporama;

// Décalage d'entrée des éléments de l'ouverture (en ms)
const decale = (ms) => ({ animationDelay: `${ms}ms` });

// « +18000 » → préfixe « + », nombre 18000
const decouper = (v) => {
  const m = v.match(/^(\D*)(\d+)(\D*)$/);
  return m ? { avant: m[1], nombre: Number(m[2]), apres: m[3] } : { avant: "", nombre: 0, apres: v };
};

// Chiffre clé : grand nombre vert, libellé en petites capitales (style institutionnel)
const Chiffre = ({ valeur, label, accent }) => {
  const { avant, nombre, apres } = decouper(valeur);
  const [ref, courant] = useCompteur(nombre);
  return (
      <div ref={ref}>
        <span aria-hidden="true" className={`mb-3 block h-[3px] w-8 rounded-full ${accent}`} />
        <dt className="sr-only">{label.replace("\n", " ")}</dt>
        <dd className="m-0 text-[30px] font-bold leading-none tabular-nums tracking-[-0.02em] text-primary sm:text-[34px]">
          {avant}
          {courant.toLocaleString("fr-FR")}
          {apres}
        </dd>
        <dd className="m-0 mt-2 whitespace-pre-line text-[11px] font-medium uppercase leading-4 tracking-[0.06em] text-muted">{label}</dd>
      </div>
  );
};

Chiffre.propTypes = { valeur: PropTypes.string.isRequired, label: PropTypes.string.isRequired, accent: PropTypes.string };

// Diaporama en fondu enchaîné, avec léger zoom lent ; s'arrête si l'utilisateur réduit les animations
const useDiaporama = (nombre) => {
  const [actif, setActif] = useState(0);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    const reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduit || pause || nombre < 2) return undefined;
    const id = setTimeout(() => setActif((i) => (i + 1) % nombre), DUREE_DIAPO);
    return () => clearTimeout(id);
  }, [actif, pause, nombre]);
  return { actif, setActif, setPause };
};

const Diapos = ({ actif, className = "" }) => (
    <div className={`overflow-hidden ${className}`}>
      {diapos.map((d, i) => (
          <img
              key={d.src}
              src={d.src}
              alt={i === actif ? d.legende : ""}
              aria-hidden={i !== actif}
              fetchPriority={i === 0 ? "high" : "low"}
              className={`diapo absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
                  i === actif ? "diapo--active opacity-100" : "opacity-0"
              }`}
          />
      ))}
    </div>
);

Diapos.propTypes = { actif: PropTypes.number.isRequired, className: PropTypes.string };

const Points = ({ actif, setActif }) => (
    <div className="flex items-center gap-2">
      {diapos.map((d, i) => (
          <button
              key={d.src}
              type="button"
              onClick={() => setActif(i)}
              aria-label={`Photo ${i + 1} sur ${diapos.length}`}
              aria-current={i === actif}
              className={`h-2 cursor-pointer rounded-full border-none p-0 transition-all duration-300 ${i === actif ? "w-6 bg-primary" : "w-2 bg-heading/25 hover:bg-heading/50"}`}
          />
      ))}
    </div>
);

Points.propTypes = { actif: PropTypes.number.isRequired, setActif: PropTypes.func.isRequired };

const Ouverture = () => {
  const navigate = useNavigate();
  const { actif, setActif, setPause } = useDiaporama(diapos.length);

  return (
      <section
          className="relative overflow-hidden"
          onMouseEnter={() => setPause(true)}
          onMouseLeave={() => setPause(false)}
          aria-roledescription="carrousel"
      >
        {/* Grand écran : photo pleine hauteur à droite, fondue dans le blanc vers le texte */}
        <div className="absolute inset-y-0 right-0 hidden w-[60%] lg:block">
          <Diapos actif={actif} className="absolute inset-0" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white via-white/55 to-transparent" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Mobile et tablette : photo au-dessus du texte */}
        <div className="relative aspect-[16/10] w-full lg:hidden">
          <Diapos actif={actif} className="absolute inset-0" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>

        <Conteneur className="relative flex min-h-[600px] items-center py-12 lg:py-24">
          <div className="max-w-[560px]">
            <h1 className="anim-entree m-0 text-[38px] font-extrabold leading-[1.08] tracking-[-0.025em] text-primary sm:text-[54px]">
              Un Think-Do Tank{" "}
              <span className="relative inline-block">
                <span className="relative">républicain</span>
              </span>
            </h1>
            <p className="anim-entree m-0 mt-5 text-[20px] font-medium leading-[1.35] text-heading sm:text-[24px]" style={decale(120)}>
              au service du développement économique et de la souveraineté nationale.
            </p>
            <p className="anim-entree m-0 mt-4 max-w-lg text-[16px] leading-7 text-body" style={decale(220)}>
              Experts multidisciplinaires en intelligence économique. Notre socle : la veille, l&apos;influence et la
              protection, complétées par l&apos;innovation et la stratégie.
            </p>

            <div className="anim-entree mt-8 flex flex-wrap items-center gap-3" style={decale(320)}>
              <a href="/#offres-services" onClick={(e) => handleAnchorClick(e, "offres-services", navigate)} className={`${classeBouton()} group`}>
                Découvrir nos offres
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a href="/#publications" onClick={(e) => handleAnchorClick(e, "publications", navigate)} className={`${classeBouton("secondaire")} bg-white/90`}>
                Lire nos publications
              </a>
            </div>

            <dl className="anim-entree m-0 mt-12 grid max-w-lg grid-cols-3 gap-6" style={decale(420)}>
              {stats.map((s, i) => (
                  <Chiffre key={s.label} valeur={s.value} label={s.label} />
              ))}
            </dl>
          </div>
        </Conteneur>

        {/* Légende de la photo et points de navigation */}
        <Conteneur className="relative -mt-4 flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:items-center sm:justify-end lg:absolute lg:inset-x-0 lg:bottom-6 lg:mt-0 lg:pb-0">
          <p className="m-0 flex items-center gap-2 text-[12px] text-muted" aria-live="polite">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {diapos[actif].legende}
          </p>
          <Points actif={actif} setActif={setActif} />
        </Conteneur>
      </section>
  );
};

export default Ouverture;
