import PropTypes from "prop-types";

// Logo IE237 entouré d'un anneau qui tourne (même visuel que l'écran de chargement du site)
const ChargementLogo = ({ taille = 300, libelle = "Chargement", className = "" }) => (
    <div role="status" aria-label={libelle} className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative" style={{ width: taille, height: taille }}>
        <svg viewBox="0 0 96 96" className="anim-rotation absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="48" cy="48" r="45" fill="none" stroke="#EDEDED" strokeWidth="2.5" />
          <circle cx="48" cy="48" r="45" fill="none" stroke="#1B5E20" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="70 213" />
        </svg>
        <img src="/logo-ie237.svg" alt="" className="anim-respiration absolute inset-[15%] h-[70%] w-[70%]" />
      </div>
    </div>
);

ChargementLogo.propTypes = {
  taille: PropTypes.number,
  libelle: PropTypes.string,
  className: PropTypes.string,
};

export default ChargementLogo;
