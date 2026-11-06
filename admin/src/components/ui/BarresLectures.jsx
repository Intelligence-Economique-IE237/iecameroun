// Lectures par jour sur 30 jours : une barre par jour, valeur au survol
import { useState } from "react";
import { nombre } from "../../utils/format";

const jourCourt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const libelleJour = (iso) => jourCourt.format(new Date(`${iso}T00:00:00Z`));

export default function BarresLectures({ parJour, hauteur = 120 }) {
  const [survol, setSurvol] = useState(null);
  if (!parJour?.length) return null;

  const max = Math.max(1, ...parJour.map((j) => j.nombre));
  const largeur = 100 / parJour.length;
  const affiche = survol ?? parJour.length - 1; // par défaut : aujourd'hui

  return (
    <div>
      <p className="mb-2 h-5 text-xs text-muted">
        <span className="font-medium text-heading">{libelleJour(parJour[affiche].jour)}</span> :{" "}
        {nombre(parJour[affiche].nombre)} lecture{parJour[affiche].nombre > 1 ? "s" : ""}
      </p>
      <div className="relative" style={{ height: hauteur }} onMouseLeave={() => setSurvol(null)}>
        {/* Ligne de base */}
        <span className="absolute inset-x-0 bottom-0 h-px bg-line" />
        {parJour.map((j, i) => (
          <button
            key={j.jour}
            type="button"
            onMouseEnter={() => setSurvol(i)}
            onFocus={() => setSurvol(i)}
            aria-label={`${libelleJour(j.jour)} : ${j.nombre} lecture(s)`}
            className="group absolute bottom-0 h-full"
            style={{ left: `${i * largeur}%`, width: `${largeur}%` }}
          >
            <span
              className={`absolute bottom-0 left-[15%] right-[15%] rounded-t-[3px] transition-colors ${
                i === affiche ? "bg-primary" : "bg-primary/35 group-hover:bg-primary/60"
              }`}
              style={{ height: j.nombre ? `${Math.max(3, (j.nombre / max) * 100)}%` : 0 }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted">
        <span>{libelleJour(parJour[0].jour)}</span>
        <span>Aujourd'hui</span>
      </div>
    </div>
  );
}
