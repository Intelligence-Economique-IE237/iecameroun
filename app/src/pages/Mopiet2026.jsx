import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  CalendarDays,
  MapPin,
  Users,
  GraduationCap,
  UserCheck,
  Download,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RevealOnScroll from "../components/RevealOnScroll";
import { mopiet, jours, volets } from "../data/Mopiet2026";


const todayInYaounde = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Douala" }).format(new Date());

// "Module 4 – Volet offensif de l'IET : détection…" → { numero, titre, detail }
const parseModule = (activity) => {
  const match = activity.match(/^Module (\d+) – (.+)$/);
  if (!match) return null;
  const [titre, ...rest] = match[2].split(" : ");
  return { numero: Number(match[1]), titre, detail: rest.join(" : ") };
};

const allRows = jours.flatMap((j) =>
  j.programme.filter((r) => !r.divider).map((r) => ({ ...r, jour: j })),
);

const modules = allRows
  .filter((r) => r.kind === "module")
  .map((r) => ({ ...parseModule(r.activity), speaker: r.speaker, jour: r.jour }));

const nbExercices = allRows.filter((r) => r.kind === "exercice").length;

const KIND_BADGE = {
  module: { label: "Module", className: "bg-primary-bg text-primary" },
  exercice: { label: "Exercice pratique", className: "bg-tertiary-bg text-tertiary-hover border border-tertiary-soft" },
  officiel: { label: "Officiel", className: "bg-secondary-bg text-secondary" },
};

const Mopiet2026 = () => {
  const today = useMemo(todayInYaounde, []);
  const todayIndex = jours.findIndex((j) => j.date === today);
  const [active, setActive] = useState(todayIndex >= 0 ? todayIndex : 0);
  const jour = jours[active];

  const infos = [
    { icon: CalendarDays, label: "Dates", value: mopiet.dates },
    { icon: MapPin, label: "Lieu", value: mopiet.lieu },
    { icon: Users, label: "Organisateurs", value: mopiet.organisateurs },
    { icon: GraduationCap, label: "Formateur principal", value: mopiet.formateur },
    { icon: UserCheck, label: "Point focal", value: mopiet.pointFocal },
  ];

  const chiffres = [
    { value: jours.length, label: "jours de formation" },
    { value: modules.length, label: "modules thématiques" },
    { value: nbExercices, label: "exercices pratiques" },
  ];

  return (
      <div className="w-full min-h-screen overflow-x-hidden bg-background">
        <div className="mx-auto w-full max-w-[1440px]">
          <Header hero={false} />

          <main className="w-full text-body font-[Poppins]">
            {/* En-tête */}
            <section className="relative bg-surface px-5 sm:px-10 lg:px-24 xl:px-36 py-12 sm:py-16 lg:py-20">
              <img
                  className="absolute left-0 top-0 -z-0 w-48 sm:w-72 lg:w-[420px] opacity-40 pointer-events-none"
                  alt=""
                  src="/Ellipse-737.svg"
              />

              <div className="relative flex flex-col gap-6 max-w-5xl">
                <RevealOnScroll>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-[42px] bg-primary px-5 py-2 text-sm font-medium text-surface">
                    Formation
                  </span>
                  {todayIndex >= 0 && (
                      <span className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white">
                        En cours — Jour {todayIndex + 1}
                      </span>
                  )}
                </div>
                </RevealOnScroll>

                <RevealOnScroll delay={120}>
                <div className="flex flex-col gap-3">
                  <span className="text-sm uppercase tracking-[0.2em] font-semibold text-primary">
                    Intelligence économique territoriale
                  </span>
                  <h1 className="m-0 font-[Manrope] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-heading">
                    {mopiet.sigle}
                  </h1>
                  <div className="h-1 w-16 rounded-full bg-primary" />
                  <p className="m-0 max-w-3xl text-lg sm:text-xl leading-8 text-body">
                    {mopiet.titre}
                  </p>
                </div>
                </RevealOnScroll>

                <dl className="m-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {infos.map(({ icon: Icon, label, value }, i) => (
                      <RevealOnScroll key={label} delay={240 + i * 80}>
                      <div className="h-full flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                        <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-xs font-bold uppercase tracking-wide text-heading">{label}</dt>
                          <dd className="m-0 text-sm sm:text-base text-body">{value}</dd>
                        </div>
                      </div>
                      </RevealOnScroll>
                  ))}
                </dl>
              </div>
            </section>

            {/* Chiffres clés */}
            <section className="px-5 sm:px-10 lg:px-24 xl:px-36 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {chiffres.map((c, i) => (
                    <RevealOnScroll key={c.label} delay={i * 120}>
                      <div className="rounded-2xl border border-border bg-surface p-6 text-center transition-all duration-300 hover:border-primary hover:shadow-md">
                        <p className="m-0 font-[Manrope] text-4xl sm:text-5xl font-extrabold text-primary">{c.value}</p>
                        <p className="m-0 mt-2 text-sm uppercase tracking-wide font-semibold text-heading">{c.label}</p>
                      </div>
                    </RevealOnScroll>
                ))}
              </div>
            </section>

            {/* Programme */}
            <section id="programme" className="px-5 sm:px-10 lg:px-24 xl:px-36 py-12 sm:py-16">
              <RevealOnScroll>
              <div className="flex flex-col gap-3 mb-8">
                <span className="text-sm uppercase tracking-[0.2em] font-semibold text-primary">
                  Chronogramme
                </span>
                <h2 className="m-0 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-heading">
                  Le programme jour par jour
                </h2>
              </div>
              </RevealOnScroll>

              <RevealOnScroll delay={120}>
              <div
                  role="tablist"
                  aria-label="Jours de formation"
                  className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0"
              >
                {jours.map((j, i) => {
                  const selected = i === active;
                  return (
                      <button
                          key={j.numero}
                          type="button"
                          role="tab"
                          id={`tab-jour-${j.numero}`}
                          aria-selected={selected}
                          aria-controls="panel-jour"
                          onClick={() => setActive(i)}
                          className={`shrink-0 cursor-pointer rounded-2xl border px-5 py-3 text-left transition-all duration-250 ${
                              selected
                                  ? "border-primary bg-primary text-surface shadow-md"
                                  : "border-border bg-surface text-heading hover:border-primary"
                          }`}
                      >
                        <span className={`block text-xs font-bold uppercase tracking-wide ${selected ? "text-primary-soft" : "text-primary"}`}>
                          Jour {j.numero}
                          {i === todayIndex && " · Aujourd'hui"}
                        </span>
                        <span className="block text-sm font-semibold">{j.label}</span>
                      </button>
                  );
                })}
              </div>
              </RevealOnScroll>

              <div
                  id="panel-jour"
                  role="tabpanel"
                  aria-labelledby={`tab-jour-${jour.numero}`}
                  className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-8 lg:p-10 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-6 border-b border-border">
                  <div>
                    <p className="m-0 text-sm font-bold text-primary">Jour {jour.numero} —</p>
                    <h3 className="m-0 mt-1 text-xl sm:text-2xl font-bold tracking-[-0.02em] text-heading">
                      {jour.titre}
                    </h3>
                  </div>
                  <p className="m-0 text-sm text-muted">{jour.label} 2026</p>
                </div>

                <div key={jour.numero} role="list" className="flex flex-col">
                  {jour.programme.map((row, i) => (
                      <RevealOnScroll key={i} delay={Math.min(i * 60, 480)}>
                        {row.divider ? <Divider label={row.divider} /> : <Row row={row} />}
                      </RevealOnScroll>
                  ))}
                </div>
              </div>

              <ul className="m-0 mt-4 p-0 list-none flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                {Object.values(KIND_BADGE).map((b) => (
                    <li key={b.label} className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 font-semibold ${b.className}`}>{b.label}</span>
                    </li>
                ))}
              </ul>
            </section>

            {/* Modules */}
            <section className="px-5 sm:px-10 lg:px-24 xl:px-36 py-12 sm:py-16">
              <RevealOnScroll>
              <div className="flex flex-col gap-3 mb-10 max-w-[720px]">
                <span className="text-sm uppercase tracking-[0.2em] font-semibold text-primary">
                  Contenu pédagogique
                </span>
                <h2 className="m-0 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-heading">
                  Neuf modules, du diagnostic à la mise en œuvre
                </h2>
              </div>
              </RevealOnScroll>

              <div className="flex flex-col gap-10">
                {volets.map((v) => (
                    <div key={v.titre} className="flex flex-col gap-4">
                      <RevealOnScroll>
                        <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-heading">
                          {v.titre}
                        </h3>
                      </RevealOnScroll>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {v.modules.map((n, i) => {
                          const m = modules.find((x) => x.numero === n);
                          if (!m) return null;
                          return (
                              <RevealOnScroll key={n} delay={i * 120}>
                                <article className="h-full flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-primary hover:shadow-md">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-bold text-primary">
                                      Module {String(m.numero).padStart(2, "0")} —
                                    </span>
                                    <span className="text-xs text-muted">Jour {m.jour.numero}</span>
                                  </div>
                                  <h4 className="m-0 text-lg font-bold text-heading">{m.titre}</h4>
                                  {m.detail && <p className="m-0 text-sm text-body leading-relaxed">{m.detail}</p>}
                                  <p className="m-0 mt-auto pt-3 border-t border-border text-xs font-semibold text-muted">
                                    {m.speaker}
                                  </p>
                                </article>
                              </RevealOnScroll>
                          );
                        })}
                      </div>
                    </div>
                ))}
              </div>

              <RevealOnScroll>
              <div className="mt-12 rounded-xl bg-tertiary-bg border border-tertiary-soft p-5 sm:p-6">
                <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-primary">
                  Certification
                </h3>
                <p className="m-0 mt-2 text-base text-body">
                  À l&apos;issue de la session, un certificat CAVIE est remis aux participants lors de la
                  cérémonie de clôture du vendredi 30 octobre 2026.
                </p>
              </div>
              </RevealOnScroll>
            </section>
          </main>

          <Footer />
        </div>
      </div>
  );
};

const Divider = ({ label }) => (
    <div role="listitem" className="flex items-center gap-4 py-5">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
);

Divider.propTypes = { label: PropTypes.string.isRequired };

const Row = ({ row }) => {
  const badge = KIND_BADGE[row.kind];
  const muted = row.kind === "pause" || row.kind === "synthese";

  return (
      <div
          role="listitem"
          className={`grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-6 py-4 border-b border-border ${
              row.kind === "module" ? "sm:border-l-4 sm:border-l-primary sm:pl-4" : ""
          }`}
      >
        <time className={`text-sm font-semibold tabular-nums ${muted ? "text-muted" : "text-primary"}`}>
          {row.time}
        </time>
        <div className="flex flex-col gap-1.5">
          {badge && (
              <span className={`self-start rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}>
                {badge.label}
              </span>
          )}
          <p className={`m-0 leading-relaxed ${muted ? "text-sm text-muted" : "text-base text-heading font-medium"}`}>
            {row.activity}
          </p>
          {row.speaker && (
              <p className="m-0 text-xs text-muted">{row.speaker}</p>
          )}
        </div>
      </div>
  );
};

Row.propTypes = {
  row: PropTypes.shape({
    time: PropTypes.string,
    activity: PropTypes.string,
    speaker: PropTypes.string,
    kind: PropTypes.string,
  }).isRequired,
};

export default Mopiet2026;
