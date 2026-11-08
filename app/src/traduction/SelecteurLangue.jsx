import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import { LANGUE_SOURCE, NOMS_LANGUES, basculerLangue, useTraduction } from "./traducteur";

// Interrupteur FR ⇄ EN. translate="no" : il n'est jamais traduit lui-même.
const SelecteurLangue = ({ className = "" }) => {
  const { langue, langues, occupe, erreur } = useTraduction();
  const cible = langues[1] || "en";
  const traduit = langue !== LANGUE_SOURCE;

  // Le message d'erreur disparaît tout seul
  const [message, setMessage] = useState(null);
  useEffect(() => {
    setMessage(erreur);
    if (!erreur) return undefined;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [erreur]);

  return (
    <div translate="no" className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={traduit}
        aria-label={`Langue : ${NOMS_LANGUES[langue] || langue}. Changer de langue`}
        title={traduit ? "Afficher en français" : `Translate to ${NOMS_LANGUES[cible] || cible}`}
        onClick={basculerLangue}
        className="relative inline-flex h-8 w-[76px] cursor-pointer items-center rounded-full border border-border bg-gray-100 p-0.5 text-[12px] font-semibold uppercase tracking-wide transition-colors hover:border-heading/30"
      >
        {/* Pastille qui glisse sous la langue active */}
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 h-[26px] w-[36px] rounded-full bg-primary shadow transition-transform duration-300 ${
            traduit ? "translate-x-[36px]" : "translate-x-0"
          }`}
        />
        <span className={`relative z-10 w-[36px] text-center transition-colors ${traduit ? "text-muted" : "text-white"}`}>FR</span>
        <span className={`relative z-10 flex w-[36px] items-center justify-center transition-colors ${traduit ? "text-white" : "text-muted"}`}>
          {occupe ? <Loader2 aria-label="Traduction en cours" className="h-3.5 w-3.5 animate-spin" /> : cible}
        </span>
      </button>
      {message && (
        <span role="status" className="absolute right-0 top-full z-50 mt-2 w-72 rounded-md bg-secondary-bg px-2 py-1 text-[12px] text-secondary">
          {message}
        </span>
      )}
    </div>
  );
};

SelecteurLangue.propTypes = { className: PropTypes.string };

export default SelecteurLangue;
