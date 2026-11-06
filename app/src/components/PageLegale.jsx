import { useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Conteneur, TraitAccent } from "./ui";
import { MISE_A_JOUR } from "../data/legal";

const formatDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Valeur d'une information légale ; si elle manque, un repère visible « À compléter »
export const Info = ({ valeur }) =>
    valeur ? (
        <>{valeur}</>
    ) : (
        <mark className="rounded bg-[#FFF3D6] px-1.5 py-0.5 text-[0.92em] font-medium text-[#8A4F00]">À compléter</mark>
    );

Info.propTypes = { valeur: PropTypes.node };

// Ligne « Libellé : valeur » des blocs d'identité
export const Ligne = ({ libelle, valeur }) => (
    <div className="grid gap-1 border-b border-border py-3 last:border-none sm:grid-cols-[220px_1fr] sm:gap-6">
      <dt className="text-[14px] font-semibold text-heading">{libelle}</dt>
      <dd className="m-0 text-[15px] text-body">
        <Info valeur={valeur} />
      </dd>
    </div>
);

Ligne.propTypes = { libelle: PropTypes.string.isRequired, valeur: PropTypes.node };

// Mise en page commune : titre, date de mise à jour, sommaire, sections numérotées
const PageLegale = ({ titre, description, intro, sections, autre }) => {
  useEffect(() => {
    document.title = `${titre} | IE237`;
    const meta = document.querySelector('head > meta[name="description"]');
    if (meta) meta.content = description;
  }, [titre, description]);

  return (
      <div className="w-full min-h-screen overflow-x-hidden bg-background">
        <Header hero={false} />

        <main className="w-full text-body">
          <Conteneur className="pb-8 pt-14 sm:pt-20">
            <div className="max-w-3xl">
              <TraitAccent />
              <h1 className="m-0 text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-heading sm:text-[48px]">{titre}</h1>
              <p className="m-0 mt-3 text-[14px] text-muted">
                Dernière mise à jour : {formatDate.format(new Date(`${MISE_A_JOUR}T00:00:00Z`))}
              </p>
              {intro && <div className="mt-6 text-[16px] leading-7 text-body">{intro}</div>}
            </div>
          </Conteneur>

          <Conteneur className="pb-20">
            <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
              <nav aria-label="Sommaire" className="lg:sticky lg:top-24 lg:self-start">
                <p className="m-0 mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">Sommaire</p>
                <ol className="m-0 flex list-none flex-col gap-2 border-l border-border p-0 pl-4 text-[14px]">
                  {sections.map((s, i) => (
                      <li key={s.id}>
                        <a href={`#${s.id}`} className="text-body no-underline hover:text-primary">
                          {i + 1}. {s.titre}
                        </a>
                      </li>
                  ))}
                </ol>
                <Link to={autre.vers} className="mt-6 inline-block text-[14px] font-medium text-primary no-underline hover:underline">
                  {autre.libelle} →
                </Link>
              </nav>

              <div className="flex max-w-3xl flex-col gap-12">
                {sections.map((s, i) => (
                    <section key={s.id} id={s.id} className="scroll-mt-24">
                      <h2 className="m-0 text-[22px] font-bold tracking-[-0.02em] text-heading">
                        {i + 1}. {s.titre}
                      </h2>
                      <div className="contenu-legal mt-4 flex flex-col gap-4 text-[16px] leading-7 text-body">{s.contenu}</div>
                    </section>
                ))}
              </div>
            </div>
          </Conteneur>
        </main>

        <Footer />
      </div>
  );
};

PageLegale.propTypes = {
  titre: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  intro: PropTypes.node,
  sections: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.string.isRequired, titre: PropTypes.string.isRequired, contenu: PropTypes.node.isRequired }),
  ).isRequired,
  autre: PropTypes.shape({ vers: PropTypes.string.isRequired, libelle: PropTypes.string.isRequired }).isRequired,
};

export default PageLegale;
