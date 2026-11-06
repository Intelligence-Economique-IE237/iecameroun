import { useId, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import RevealOnScroll from "../RevealOnScroll";
import { Carte, EnteteSection, Etiquette, Section } from "../ui";
import useProgression from "../../utils/useProgression";
import { handleAnchorClick } from "../../utils/scrollToSection";
import { cacao, indicateursEconomie, sourceEconomie } from "../../data/economie";

// Couleurs des courbes (contraste ≥ 3:1 sur blanc) : vert IE237 pour l'économie, ambre pour le cacao
const VERT = { trait: "#1B5E20", aire: "#1B5E20" };
const AMBRE = { trait: "#A15C00", aire: "#F9A825" };
const GRILLE = "#E8E8E8";

const { debutProjections } = sourceEconomie;
const ANNEE_REFERENCE = debutProjections - 1; // dernière année estimée par le FMI

const nombre = (v, decimales = 1) =>
    v.toLocaleString("fr-FR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MOIS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
// « 2026-10 » → « oct. 2026 »
const moisCourt = (cle) => `${MOIS[Number(cle.slice(5)) - 1]} ${cle.slice(0, 4)}`;
const moisLong = (cle) => `${MOIS_LONG[Number(cle.slice(5)) - 1]} ${cle.slice(0, 4)}`;

// Dimensions internes du tracé (le SVG s'étire ensuite à la largeur de la carte)
const L = 300;
const H = 96;
const MARGE = { haut: 12, bas: 6, gauche: 4, droite: 4 };

/**
 * Petite courbe animée.
 * serie      : [[clé, valeur], ...] (clé = année ou « AAAA-MM »)
 * iRef       : index du point mis en avant (dernière valeur connue)
 * iProj      : index à partir duquel les valeurs sont des projections (pointillé), ou null
 * libelleX   : clé → texte affiché (infobulle et axe)
 * etat       : clé → « (projection) », « (estimation) »…
 * annotation : { i, texte } point remarquable étiqueté directement (ex. record)
 */
const Courbe = ({ serie, iRef, iProj = null, couleur, unite, decimales, libelleX, etat = () => "", annotation, progression, hauteur = "h-24", nom }) => {
  const id = useId();
  const [survol, setSurvol] = useState(null);

  const geo = useMemo(() => {
    const valeurs = serie.map(([, v]) => v);
    const min = Math.min(...valeurs);
    const max = Math.max(...valeurs);
    const marge = (max - min) * 0.12 || 1;
    const y0 = min - marge;
    const y1 = max + marge;
    const n = serie.length - 1;
    const x = (i) => MARGE.gauche + (i / n) * (L - MARGE.gauche - MARGE.droite);
    const y = (v) => MARGE.haut + (1 - (v - y0) / (y1 - y0)) * (H - MARGE.haut - MARGE.bas);
    const points = serie.map(([, v], i) => [x(i), y(v)]);
    const trace = (pts) => pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
    const finHisto = iProj === null ? points.length : iProj; // les projections commencent après la référence
    const histo = points.slice(0, finHisto);
    const proj = iProj === null ? [] : points.slice(iProj - 1);
    return {
      points,
      cheminHisto: trace(histo),
      cheminProj: proj.length ? trace(proj) : "",
      aire: `${trace(histo)}L${histo.at(-1)[0].toFixed(1)},${H}L${histo[0][0].toFixed(1)},${H}Z`,
      xFrontiere: iProj === null ? null : points[iProj - 1][0],
    };
  }, [serie, iProj]);

  const largeurVisible = MARGE.gauche + progression * (L - MARGE.gauche);
  const pct = (i) => ({ left: `${(geo.points[i][0] / L) * 100}%`, top: `${(geo.points[i][1] / H) * 100}%` });

  const choisir = (clientX, rect) => {
    const xRel = ((clientX - rect.left) / rect.width) * L;
    let meilleur = 0;
    geo.points.forEach(([px], i) => {
      if (Math.abs(px - xRel) < Math.abs(geo.points[meilleur][0] - xRel)) meilleur = i;
    });
    setSurvol(meilleur);
  };

  return (
      <div className="relative">
        <svg
            viewBox={`0 0 ${L} ${H}`}
            preserveAspectRatio="none"
            className={`block w-full cursor-crosshair overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${hauteur}`}
            role="img"
            aria-label={`${nom}, de ${libelleX(serie[0][0])} à ${libelleX(serie.at(-1)[0])}. Survolez ou utilisez les flèches pour lire les valeurs.`}
            tabIndex={0}
            onPointerMove={(e) => choisir(e.clientX, e.currentTarget.getBoundingClientRect())}
            onPointerLeave={() => setSurvol(null)}
            onBlur={() => setSurvol(null)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              e.preventDefault();
              const depart = survol ?? iRef;
              setSurvol(Math.max(0, Math.min(serie.length - 1, depart + (e.key === "ArrowRight" ? 1 : -1))));
            }}
        >
          <defs>
            <clipPath id={`${id}-clip`}>
              <rect x="0" y="-10" width={largeurVisible} height={H + 20} />
            </clipPath>
            <linearGradient id={`${id}-degrade`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={couleur.aire} stopOpacity="0.18" />
              <stop offset="100%" stopColor={couleur.aire} stopOpacity="0" />
            </linearGradient>
          </defs>

          <line x1="0" x2={L} y1={H - 0.5} y2={H - 0.5} stroke={GRILLE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {geo.xFrontiere !== null && (
              <line x1={geo.xFrontiere} x2={geo.xFrontiere} y1="0" y2={H} stroke={GRILLE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          )}

          <g clipPath={`url(#${id}-clip)`}>
            <path d={geo.aire} fill={`url(#${id}-degrade)`} />
            <path d={geo.cheminHisto} fill="none" stroke={couleur.trait} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {geo.cheminProj && (
                <path d={geo.cheminProj} fill="none" stroke={couleur.trait} strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" opacity="0.7" vectorEffect="non-scaling-stroke" />
            )}
          </g>

          {survol !== null && (
              <line x1={geo.points[survol][0]} x2={geo.points[survol][0]} y1="0" y2={H} stroke="#0A0A0A" strokeOpacity="0.25" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          )}
        </svg>

        {/* Points et étiquettes en HTML : restent nets quelle que soit la largeur */}
        {progression >= 1 && (
            <span className="courbe-point courbe-point--pulse" style={{ ...pct(iRef), "--couleur": couleur.trait }} aria-hidden="true" />
        )}
        {annotation && progression >= 1 && survol === null && (
            <span
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap pb-1.5 text-[11px] text-body"
                style={pct(annotation.i)}
            >
              {annotation.texte}
            </span>
        )}
        {survol !== null && (
            <>
              <span className="courbe-point" style={{ ...pct(survol), "--couleur": couleur.trait }} aria-hidden="true" />
              <div
                  role="status"
                  className="pointer-events-none absolute -top-11 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.2)]"
                  style={{ left: `${Math.min(85, Math.max(15, (geo.points[survol][0] / L) * 100))}%` }}
              >
                <span className="font-semibold tabular-nums text-heading">
                  {nombre(serie[survol][1], decimales)} {unite}
                </span>
                <span className="text-muted">
                  {" "}· {libelleX(serie[survol][0])} {etat(serie[survol][0])}
                </span>
              </div>
            </>
        )}

        <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-muted">
          <span>{libelleX(serie[0][0])}</span>
          <span>{libelleX(serie.at(-1)[0])}</span>
        </div>
      </div>
  );
};

Courbe.propTypes = {
  serie: PropTypes.array.isRequired,
  iRef: PropTypes.number.isRequired,
  iProj: PropTypes.number,
  couleur: PropTypes.object.isRequired,
  unite: PropTypes.string.isRequired,
  decimales: PropTypes.number.isRequired,
  libelleX: PropTypes.func.isRequired,
  etat: PropTypes.func,
  annotation: PropTypes.object,
  progression: PropTypes.number.isRequired,
  hauteur: PropTypes.string,
  nom: PropTypes.string.isRequired,
};

// Valeur principale qui monte avec la progression
const Valeur = ({ valeur, p, decimales, unite, grande = false }) => (
    <p className={`m-0 mt-3 font-semibold leading-none tracking-[-0.03em] tabular-nums text-heading ${grande ? "text-[38px]" : "text-[30px]"}`}>
      {nombre(valeur * p, decimales)}
      <span className="ml-1 text-[15px] font-medium tracking-normal text-body">{unite}</span>
    </p>
);

Valeur.propTypes = { valeur: PropTypes.number, p: PropTypes.number, decimales: PropTypes.number, unite: PropTypes.string, grande: PropTypes.bool };

// Tuile d'un indicateur du FMI
const TuileFmi = ({ ind, delai }) => {
  const [ref, p] = useProgression(1700, delai);
  const iRef = ind.serie.findIndex(([a]) => a === ANNEE_REFERENCE);
  const iProj = ind.serie.findIndex(([a]) => a >= debutProjections);
  const valeur = ind.serie[iRef][1];
  const ecart = valeur - ind.serie[iRef - 1][1];
  const enPoints = ind.unite.startsWith("%");

  return (
      <div ref={ref} className="h-full">
        <Carte className="flex h-full flex-col p-5">
          <Etiquette>{ind.libelle}</Etiquette>
          <Valeur valeur={valeur} p={p} decimales={ind.decimales} unite={ind.unite} />
          <p className="m-0 mt-2 text-[13px] text-muted">
            {ANNEE_REFERENCE} (est.) ·{" "}
            <span className="tabular-nums text-body">
              {ecart >= 0 ? "+" : "−"}
              {nombre(Math.abs(ecart), ind.decimales)}
              {enPoints ? " pt" : ` ${ind.unite}`}
            </span>{" "}
            vs {ANNEE_REFERENCE - 1}
          </p>
          <div className="mt-auto pt-6">
            <Courbe
                nom={ind.libelle}
                serie={ind.serie}
                iRef={iRef}
                iProj={iProj === -1 ? null : iProj}
                couleur={VERT}
                unite={ind.unite}
                decimales={ind.decimales}
                libelleX={String}
                etat={(a) => (a >= debutProjections ? "(projection)" : a === ANNEE_REFERENCE ? "(estimation)" : "")}
                progression={p}
            />
          </div>
        </Carte>
      </div>
  );
};

TuileFmi.propTypes = { ind: PropTypes.object.isRequired, delai: PropTypes.number };

// Tuile mise en avant : cours mondial du cacao, mensuel
const TuileCacao = () => {
  const [ref, p] = useProgression(2000, 0);
  const { serie } = cacao;
  const iRef = serie.length - 1;
  const [cleDernier, dernier] = serie[iRef];
  const ilYAUnAn = serie.find(([cle]) => cle === `${Number(cleDernier.slice(0, 4)) - 1}${cleDernier.slice(4)}`);
  const variation = ilYAUnAn ? ((dernier - ilYAUnAn[1]) / ilYAUnAn[1]) * 100 : null;
  const iMax = serie.reduce((m, [, v], i) => (v > serie[m][1] ? i : m), 0);

  return (
      <div ref={ref} className="h-full">
        <Carte className="flex h-full flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Etiquette>{cacao.libelle}</Etiquette>
            <span className="rounded-full border border-tertiary/60 px-2.5 py-0.5 text-[11px] font-medium text-[#8A4F00]">
              Filière stratégique du Cameroun
            </span>
          </div>
          <Valeur valeur={dernier} p={p} decimales={cacao.decimales} unite={cacao.unite} grande />
          <p className="m-0 mt-2 text-[13px] text-muted">
            Moyenne de {moisLong(cleDernier)}
            {variation !== null && (
                <>
                  {" "}·{" "}
                  <span className="tabular-nums text-body">
                    {variation >= 0 ? "+" : "−"}
                    {nombre(Math.abs(variation), 0)} %
                  </span>{" "}
                  sur un an
                </>
            )}
          </p>
          <div className="mt-auto pt-8">
            <Courbe
                nom={cacao.libelle}
                serie={serie}
                iRef={iRef}
                couleur={AMBRE}
                unite={cacao.unite}
                decimales={cacao.decimales}
                libelleX={moisCourt}
                annotation={{ i: iMax, texte: `Record : ${nombre(serie[iMax][1], 2)} $ (${moisCourt(serie[iMax][0])})` }}
                progression={p}
                hauteur="h-32"
            />
          </div>
        </Carte>
      </div>
  );
};

const Economie = () => {
  const navigate = useNavigate();
  const [croissance, ...autres] = indicateursEconomie;

  return (
      <Section id="economie">
        <EnteteSection
            titre="Le Cameroun en Statistiques"
            texte="Les indicateurs que suit notre veille économique : grands équilibres du FMI jusqu'en 2030 et cours mondial du cacao. Survolez une courbe pour lire chaque valeur."
            action={
              <a
                  href="/#publications"
                  onClick={(e) => handleAnchorClick(e, "publications", navigate)}
                  className="inline-flex shrink-0 items-center gap-1.5 text-[15px] text-heading no-underline hover:text-primary"
              >
                Nos notes de veille <ArrowRight className="h-4 w-4" />
              </a>
            }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RevealOnScroll className="h-full sm:col-span-2">
            <TuileCacao />
          </RevealOnScroll>
          <RevealOnScroll delay={90} className="h-full">
            <TuileFmi ind={croissance} delai={150} />
          </RevealOnScroll>
          {autres.map((ind, i) => (
              <RevealOnScroll key={ind.cle} delay={(i + 1) * 90} className="h-full">
                <TuileFmi ind={ind} delai={(i + 2) * 120} />
              </RevealOnScroll>
          ))}
        </div>

        {/* Légende et sources */}
        <div className="mt-6 flex flex-col gap-3 text-[13px] text-muted lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <svg width="22" height="6" aria-hidden="true"><line x1="1" x2="21" y1="3" y2="3" stroke={VERT.trait} strokeWidth="2" strokeLinecap="round" /></svg>
              Observé ({ANNEE_REFERENCE} estimé)
            </span>
            <span className="inline-flex items-center gap-2">
              <svg width="22" height="6" aria-hidden="true"><line x1="1" x2="21" y1="3" y2="3" stroke={VERT.trait} strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" opacity="0.7" /></svg>
              Projection FMI ({debutProjections}–{croissance.serie.at(-1)[0]})
            </span>
            <span className="inline-flex items-center gap-2">
              <svg width="22" height="6" aria-hidden="true"><line x1="1" x2="21" y1="3" y2="3" stroke={AMBRE.trait} strokeWidth="2" strokeLinecap="round" /></svg>
              Cacao, moyenne mensuelle
            </span>
          </div>
          <div className="flex flex-col gap-1 lg:max-w-[440px] lg:text-right">
            <a href={sourceEconomie.url} target="_blank" rel="noreferrer" className="text-muted no-underline hover:text-heading">
              Source : {sourceEconomie.libelle} <ExternalLink className="ml-0.5 inline h-3.5 w-3.5 align-[-2px]" />
            </a>
            <a href={cacao.url} target="_blank" rel="noreferrer" className="text-muted no-underline hover:text-heading">
              Cacao : {cacao.source} <ExternalLink className="ml-0.5 inline h-3.5 w-3.5 align-[-2px]" />
            </a>
          </div>
        </div>

        <details className="mt-4 text-[13px] text-body">
          <summary className="cursor-pointer text-muted hover:text-heading">Voir les données en tableau</summary>
          <div className="mt-3 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left tabular-nums">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 pr-4 font-medium">Année</th>
                    {indicateursEconomie.map((ind) => (
                        <th key={ind.cle} className="py-2 pr-4 font-medium">
                          {ind.libelle} ({ind.unite})
                        </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {croissance.serie.map(([annee], i) => (
                      <tr key={annee} className="border-b border-border/60">
                        <td className="py-1.5 pr-4 text-heading">
                          {annee}
                          {annee >= debutProjections && <span className="text-muted"> (proj.)</span>}
                        </td>
                        {indicateursEconomie.map((ind) => (
                            <td key={ind.cle} className="py-1.5 pr-4">
                              {ind.serie[i] ? nombre(ind.serie[i][1], ind.decimales) : "—"}
                            </td>
                        ))}
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              <table className="w-full border-collapse text-left tabular-nums">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 pr-4 font-medium">Mois</th>
                    <th className="py-2 pr-4 font-medium">Cacao ({cacao.unite})</th>
                  </tr>
                </thead>
                <tbody>
                  {[...cacao.serie].reverse().map(([cle, v]) => (
                      <tr key={cle} className="border-b border-border/60">
                        <td className="py-1.5 pr-4 text-heading">{moisCourt(cle)}</td>
                        <td className="py-1.5 pr-4">{nombre(v, 2)}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </Section>
  );
};

export default Economie;
