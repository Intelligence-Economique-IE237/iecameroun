import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, MapPin, Images } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RevealOnScroll from "../components/RevealOnScroll";
import {
  listeEvenements,
  statutEvenement,
  todayInYaounde,
  STATUT_LABEL,
} from "../data/evenements";

const SECTION_X = "px-5 sm:px-10 lg:px-24 xl:px-36";

const STATUT_STYLE = {
  "en-cours": "bg-secondary text-white",
  "a-venir": "bg-tertiary-bg text-tertiary-hover border border-tertiary-soft",
  passe: "bg-background text-muted border border-border",
};

const EventCard = ({ evt, statut }) => {
  const nbPhotos = evt.galerie?.length ?? 0;
  const cover = evt.couverture ?? evt.galerie?.[0]?.src;

  return (
      <Link
          to={`/evenements/${evt.slug}`}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface no-underline shadow-sm transition-all duration-300 hover:border-primary hover:shadow-lg"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-primary-bg">
          {cover ? (
              <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
          ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-[Manrope] text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-primary">
                  {evt.sigle}
                </span>
              </div>
          )}
          <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${STATUT_STYLE[statut]}`}>
            {STATUT_LABEL[statut]}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <span className="text-xs font-bold uppercase tracking-wide text-primary">{evt.type}</span>
          <h3 className="m-0 text-xl font-bold tracking-[-0.02em] text-heading">{evt.sigle}</h3>
          <p className="m-0 text-sm leading-relaxed text-body">{evt.titre}</p>

          <ul className="m-0 mt-auto flex list-none flex-col gap-2 border-t border-border p-0 pt-4 text-sm text-muted">
            <li className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
              {evt.dates}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              {evt.lieu}
            </li>
            {nbPhotos > 0 && (
                <li className="flex items-center gap-2">
                  <Images className="h-4 w-4 shrink-0 text-primary" />
                  {nbPhotos} photo{nbPhotos > 1 ? "s" : ""}
                </li>
            )}
          </ul>

          <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Voir l&apos;événement
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
  );
};

EventCard.propTypes = {
  evt: PropTypes.object.isRequired,
  statut: PropTypes.string.isRequired,
};

const Evenements = () => {
  const today = useMemo(todayInYaounde, []);

  useEffect(() => {
    document.title = "Événements | IE237";
    const meta = document.querySelector('head > meta[name="description"]');
    if (meta) {
      meta.content =
          "Formations, conférences et rencontres organisées par le Think-Do Tank IE237 : programmes et galeries photos.";
    }
  }, []);

  const avecStatut = listeEvenements.map((evt) => ({ evt, statut: statutEvenement(evt, today) }));
  const aVenir = avecStatut.filter((e) => e.statut !== "passe");
  const passes = avecStatut.filter((e) => e.statut === "passe");

  const groupes = [
    { titre: "En cours et à venir", items: aVenir },
    { titre: "Événements passés", items: passes },
  ].filter((g) => g.items.length > 0);

  return (
      <div className="w-full min-h-screen overflow-x-hidden bg-background">
        <div className="mx-auto w-full max-w-[1440px]">
          <Header hero={false} />

          <main className="w-full text-body font-[Poppins]">
            <section className={`relative bg-surface ${SECTION_X} py-12 sm:py-16 lg:py-20`}>
              <img
                  className="absolute left-0 top-0 w-48 sm:w-72 lg:w-[420px] opacity-40 pointer-events-none"
                  alt=""
                  src="/Ellipse-737.svg"
              />
              <RevealOnScroll>
                <div className="relative flex max-w-3xl flex-col gap-3">
                  <span className="text-sm uppercase tracking-[0.2em] font-semibold text-primary">Agenda</span>
                  <h1 className="m-0 font-[Manrope] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-heading">
                    Nos événements
                  </h1>
                  <div className="h-1 w-16 rounded-full bg-primary" />
                  <p className="m-0 text-lg sm:text-xl leading-8 text-body">
                    Formations, conférences et rencontres institutionnelles organisées par le Think-Do Tank IE237.
                  </p>
                </div>
              </RevealOnScroll>
            </section>

            {groupes.map((g) => (
                <section key={g.titre} className={`${SECTION_X} py-12 sm:py-16`}>
                  <RevealOnScroll>
                    <h2 className="m-0 mb-8 text-sm font-bold uppercase tracking-wide text-heading">{g.titre}</h2>
                  </RevealOnScroll>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {g.items.map(({ evt, statut }, i) => (
                        <RevealOnScroll key={evt.slug} delay={(i % 3) * 120}>
                          <EventCard evt={evt} statut={statut} />
                        </RevealOnScroll>
                    ))}
                  </div>
                </section>
            ))}
          </main>

          <Footer />
        </div>
      </div>
  );
};

export default Evenements;
