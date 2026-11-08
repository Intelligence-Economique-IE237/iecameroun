import { useEffect, useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { LANGUE_SOURCE, NOMS_LANGUES, basculerLangue, useTraduction } from "./traducteur";

// Interrupteur FR ⇄ EN : traduit l'interface du panneau (menus, tableaux, libellés).
// Les champs de saisie et l'éditeur de texte ne sont jamais traduits : on rédige toujours en français.
export default function SelecteurLangue({ className = "" }) {
  const { langue, langues, occupe, erreur } = useTraduction();
  const cible = langues[1] || "en";
  const traduit = langue !== LANGUE_SOURCE;

  const [message, setMessage] = useState(null);
  useEffect(() => {
    setMessage(erreur);
    if (!erreur) return undefined;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [erreur]);

  return (
    <div translate="no" className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        {occupe ? (
          <Loader2 aria-label="Traduction en cours" className="size-4 animate-spin text-muted" />
        ) : (
          <Languages aria-hidden="true" className="size-4 text-muted" />
        )}
        <button
          type="button"
          role="switch"
          aria-checked={traduit}
          aria-label={`Langue : ${NOMS_LANGUES[langue] || langue}. Changer de langue`}
          title={traduit ? "Afficher en français" : `Translate to ${NOMS_LANGUES[cible] || cible}`}
          onClick={basculerLangue}
          className="relative inline-flex h-7 w-[68px] items-center rounded-full bg-gray-100 p-0.5 text-xs font-semibold uppercase"
        >
          <span
            aria-hidden="true"
            className={`absolute top-0.5 left-0.5 h-6 w-8 rounded-full bg-primary shadow-sm transition-transform duration-300 ${
              traduit ? "translate-x-8" : "translate-x-0"
            }`}
          />
          <span className={`relative z-10 w-8 text-center transition-colors ${traduit ? "text-muted" : "text-white"}`}>FR</span>
          <span className={`relative z-10 w-8 text-center transition-colors ${traduit ? "text-white" : "text-muted"}`}>{cible}</span>
        </button>
      </div>
      {message && (
        <p role="status" className="text-xs text-secondary">
          {message}
        </p>
      )}
    </div>
  );
}
