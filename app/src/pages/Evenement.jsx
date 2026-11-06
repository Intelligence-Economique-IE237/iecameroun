import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  GraduationCap,
  UserCheck,
  Download,
  Info,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RevealOnScroll from "../components/RevealOnScroll";
import EventGallery from "../components/EventGallery";
import ChargementLogo from "../components/ChargementLogo";
import ContenuRiche from "../components/ContenuRiche";
import { getEvenementApi, useApi } from "../api";
import { depuisApi } from "../data/evenements/depuisApi";
import {
  getEvenement,
  statutEvenement,
  todayInYaounde,
  STATUT_LABEL,
} from "../data/evenements";

const ICONS = {
  users: Users,
  graduation: GraduationCap,
  "user-check": UserCheck,
  info: Info,
};

const NOMBRES = ["Zéro", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix"];

const KIND_BADGE = {
  module: { label: "Module", className: "border border-primary/30 bg-white text-primary" },
  exercice: { label: "Exercice pratique", className: "border border-tertiary/50 bg-white text-tertiary-hover" },
  officiel: { label: "Officiel", className: "border border-secondary/30 bg-white text-secondary" },
};

// "Module 4 – Volet offensif de l'IET : détection…" → { numero, titre, detail }
const parseModule = (activity) => {
  const match = activity.match(/^Module (\d+) – (.+)$/);
  if (!match) return null;
  const [titre, ...rest] = match[2].split(" : ");
  return { numero: Number(match[1]), titre, detail: rest.join(" : ") };
};

const SECTION_X = "mx-auto w-full max-w-[1080px] px-5 sm:px-8";

const SectionTitle = ({ kicker, title, className = "mb-8" }) => (
    <RevealOnScroll>
      <div className={`flex flex-col gap-3 max-w-[720px] ${className}`}>
        <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{kicker}</span>
        <h2 className="m-0 text-[28px] sm:text-[36px] font-medium tracking-[-0.03em] text-heading">{title}</h2>
      </div>
    </RevealOnScroll>
);

SectionTitle.propTypes = {
  kicker: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
};

const Evenement = () => {
  const { slug } = useParams();
  const statique = getEvenement(slug);
  // Les événements créés depuis le panneau admin viennent de l'API
  const { donnees, chargement } = useApi(
      () => (statique ? Promise.resolve(null) : getEvenementApi(slug).then(depuisApi)),
      slug,
  );
  const evt = statique ?? donnees;

  useEffect(() => {
    if (!evt) return;
    document.title = `${evt.sigle} | IE237`;
    const meta = document.querySelector('head > meta[name="description"]');
    if (meta && evt.resume) meta.content = evt.resume;
  }, [evt]);

  if (!evt && chargement) {
    return (
        <div className="w-full min-h-screen bg-background">
          <Header hero={false} />
          <div className="flex justify-center py-32">
            <ChargementLogo libelle="Chargement de l'événement" />
          </div>
        </div>
    );
  }
  if (!evt) return <Navigate to="/evenements" replace />;

  return <EvenementContenu key={evt.slug} evt={evt} />;
};

const EvenementContenu = ({ evt }) => {
  const today = useMemo(todayInYaounde, []);
  const statut = statutEvenement(evt, today);
  const jours = evt.jours ?? [];

  const todayIndex = jours.findIndex((j) => j.date === today);
  const [active, setActive] = useState(todayIndex >= 0 ? todayIndex : 0);
  const jour = jours[active];

  const { modules, nbExercices } = useMemo(() => {
    const rows = jours.flatMap((j) =>
        j.programme.filter((r) => !r.divider).map((r) => ({ ...r, jour: j })),
    );
    return {
      modules: rows
          .filter((r) => r.kind === "module")
          .map((r) => ({ ...parseModule(r.activity), speaker: r.speaker, jour: r.jour })),
      nbExercices: rows.filter((r) => r.kind === "exercice").length,
    };
  }, [jours]);

  const infos = [
    { icon: CalendarDays, label: "Dates", value: evt.dates },
    { icon: MapPin, label: "Lieu", value: evt.lieu },
    ...(evt.infos ?? []).map((i) => ({ ...i, icon: ICONS[i.icon] ?? Info })),
  ];

  const chiffres = [
    jours.length > 0 && { value: jours.length, label: jours.length > 1 ? "jours" : "jour" },
    modules.length > 0 && { value: modules.length, label: "modules thématiques" },
    nbExercices > 0 && { value: nbExercices, label: "exercices pratiques" },
  ].filter(Boolean);

  const galerie = evt.galerie ?? [];

  return (
      <div className="w-full min-h-screen overflow-x-hidden bg-background">
        <div className="mx-auto w-full max-w-[1440px]">
          <Header hero={false} />

          <main className="w-full text-body">
            {/* En-tête */}
            <section className={`relative ${SECTION_X} py-12 sm:py-16 lg:py-20`}>

              <div className="relative flex flex-col gap-6 max-w-5xl">
                <RevealOnScroll>
                  <Link
                      to="/evenements"
                      className="inline-flex items-center gap-2 text-sm font-medium text-muted no-underline transition-colors hover:text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Tous les événements
                  </Link>
                </RevealOnScroll>

                <RevealOnScroll delay={80}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-[42px] bg-primary px-5 py-2 text-sm font-medium text-surface">
                      {evt.type}
                    </span>
                    {statut === "en-cours" ? (
                        <span className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white">
                          En cours{todayIndex >= 0 && ` — Jour ${todayIndex + 1}`}
                        </span>
                    ) : (
                        <span className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-muted">
                          {STATUT_LABEL[statut]}
                        </span>
                    )}
                  </div>
                </RevealOnScroll>

                <RevealOnScroll delay={160}>
                  <div className="flex flex-col gap-3">
                    {evt.theme && (
                        <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                          {evt.theme}
                        </span>
                    )}
                    <h1 className="m-0 text-[40px] sm:text-[52px] font-bold leading-[1.06] tracking-[-0.035em] text-heading">
                      {evt.sigle}
                    </h1>
                    <p className="m-0 max-w-3xl text-[17px] leading-7 text-body">{evt.titre}</p>
                  </div>
                </RevealOnScroll>

                <dl className="m-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {infos.map(({ icon: Icon, label, value }, i) => (
                      <RevealOnScroll key={label} delay={240 + i * 80}>
                        <div className="h-full flex items-start gap-3 rounded-lg border border-border bg-background p-4">
                          <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <dt className="text-xs font-bold uppercase tracking-wide text-heading">{label}</dt>
                            <dd className="m-0 text-sm sm:text-base text-body">{value}</dd>
                          </div>
                        </div>
                      </RevealOnScroll>
                  ))}
                </dl>

                {evt.document && (
                    <RevealOnScroll delay={600}>
                      <a
                          href={evt.document.href}
                          download
                          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-5 py-3 text-sm font-medium text-surface no-underline transition-colors duration-250 hover:bg-primary-hover"
                      >
                        <Download className="h-4 w-4" />
                        {evt.document.label}
                      </a>
                    </RevealOnScroll>
                )}
              </div>
            </section>

            {evt.couverture && (
                <div className={SECTION_X}>
                  <RevealOnScroll>
                    <img src={evt.couverture} alt="" className="aspect-[21/9] w-full rounded-lg object-cover" />
                  </RevealOnScroll>
                </div>
            )}

            {/* Présentation (texte mis en forme depuis le panneau admin) */}
            {evt.description && (
                <section className={`${SECTION_X} py-12`}>
                  <SectionTitle kicker="Présentation" title="L'événement en bref" />
                  <RevealOnScroll>
                    <ContenuRiche html={evt.description} className="max-w-3xl text-[17px] leading-[1.8]" />
                  </RevealOnScroll>
                </section>
            )}

            {/* Chiffres clés */}
            {chiffres.length > 0 && (
                <section className={`${SECTION_X} py-12`}>
                  <div className={`grid grid-cols-1 gap-4 ${chiffres.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                    {chiffres.map((c, i) => (
                        <RevealOnScroll key={c.label} delay={i * 120}>
                          <div className="rounded-lg border border-border bg-surface p-6 text-center transition-all duration-300 hover:border-heading hover:">
                            <p className="m-0 text-4xl sm:text-5xl font-extrabold text-primary">{c.value}</p>
                            <p className="m-0 mt-2 text-sm uppercase tracking-wide font-semibold text-heading">{c.label}</p>
                          </div>
                        </RevealOnScroll>
                    ))}
                  </div>
                </section>
            )}

            {/* Programme */}
            {jour && (
                <section id="programme" className={`${SECTION_X} py-12 sm:py-16`}>
                  <SectionTitle kicker="Chronogramme" title={jours.length > 1 ? "Le programme jour par jour" : "Le programme"} />

                  {jours.length > 1 && (
                      <RevealOnScroll delay={120}>
                        <div
                            role="tablist"
                            aria-label="Jours de l'événement"
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
                                    className={`shrink-0 cursor-pointer rounded-lg border px-5 py-3 text-left transition-all duration-250 ${
                                        selected
                                            ? "border-primary bg-primary text-surface"
                                            : "border-border bg-surface text-heading hover:border-heading"
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
                  )}

                  <div
                      id="panel-jour"
                      role="tabpanel"
                      aria-labelledby={jours.length > 1 ? `tab-jour-${jour.numero}` : undefined}
                      className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-8 lg:p-10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-6 border-b border-border">
                      <div>
                        <p className="m-0 text-sm font-bold text-primary">Jour {jour.numero} —</p>
                        <h3 className="m-0 mt-1 text-xl sm:text-2xl font-bold tracking-[-0.02em] text-heading">
                          {jour.titre}
                        </h3>
                      </div>
                      <p className="m-0 text-sm text-muted">
                        {jour.label} {jour.date.slice(0, 4)}
                      </p>
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
                        <li key={b.label}>
                          <span className={`rounded-full px-2.5 py-0.5 font-semibold ${b.className}`}>{b.label}</span>
                        </li>
                    ))}
                  </ul>
                </section>
            )}

            {/* Modules */}
            {modules.length > 0 && evt.volets && (
                <section className={`${SECTION_X} py-12 sm:py-16`}>
                  <SectionTitle
                      kicker="Contenu pédagogique"
                      title={`${NOMBRES[modules.length] ?? modules.length} modules, du diagnostic à la mise en œuvre`}
                      className="mb-10"
                  />

                  <div className="flex flex-col gap-10">
                    {evt.volets.map((v) => (
                        <div key={v.titre} className="flex flex-col gap-4">
                          <RevealOnScroll>
                            <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-heading">{v.titre}</h3>
                          </RevealOnScroll>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {v.modules.map((n, i) => {
                              const m = modules.find((x) => x.numero === n);
                              if (!m) return null;
                              return (
                                  <RevealOnScroll key={n} delay={i * 120}>
                                    <article className="h-full flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:border-heading hover:">
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

                  {evt.certification && (
                      <RevealOnScroll>
                        <div className="mt-12 rounded-lg border border-border bg-white p-5 sm:p-6">
                          <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-primary">Certification</h3>
                          <p className="m-0 mt-2 text-base text-body">{evt.certification}</p>
                        </div>
                      </RevealOnScroll>
                  )}
                </section>
            )}

            {/* Galerie */}
            <section id="galerie-evenement" className={`${SECTION_X} py-12 sm:py-16`}>
              <SectionTitle kicker="Galerie" title="L'événement en images" />
              <EventGallery
                  photos={galerie}
                  emptyMessage={
                    statut === "a-venir"
                        ? "Les photos seront publiées à l'issue de l'événement."
                        : "Les photos de l'événement seront publiées prochainement."
                  }
              />
            </section>
          </main>

          <Footer />
        </div>
      </div>
  );
};

EvenementContenu.propTypes = {
  evt: PropTypes.object.isRequired,
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
          {row.speaker && <p className="m-0 text-xs text-muted">{row.speaker}</p>}
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

export default Evenement;
