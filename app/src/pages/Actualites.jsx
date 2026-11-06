import { useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight, Newspaper } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChargementLogo from "../components/ChargementLogo";
import RevealOnScroll from "../components/RevealOnScroll";
import ActualiteCard from "../components/ActualiteCard";
import { Conteneur } from "../components/ui";
import { dateLongue, getActualites, urlFichier, useApi } from "../api";

// La plus récente, en grand : image à gauche, texte à droite
const ALaUne = ({ actualite }) => {
  const image = urlFichier(actualite.image);
  return (
      <Link
          to={`/actualites/${actualite.slug}`}
          className="group grid overflow-hidden rounded-lg border border-border bg-white no-underline transition-colors hover:border-primary/50 lg:grid-cols-[1.25fr_1fr]"
      >
        <div className="aspect-[16/10] overflow-hidden bg-[#F1F4F1] lg:aspect-auto lg:min-h-[360px]">
          {image ? (
              <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          ) : (
              <div className="grid h-full w-full place-items-center">
                <img src="/logo-ie237.svg" alt="" className="h-20 w-20 opacity-50 grayscale" />
              </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-tertiary/15 px-3 py-1 text-[12px] font-semibold text-heading">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-tertiary" />À la une
          </span>
          <h2 className="m-0 text-[24px] font-bold leading-[1.2] tracking-[-0.02em] text-heading transition-colors group-hover:text-primary sm:text-[30px]">
            {actualite.titre}
          </h2>
          {actualite.resume && <p className="m-0 line-clamp-4 text-[16px] leading-7 text-body">{actualite.resume}</p>}
          <p className="m-0 text-[13px] text-muted">
            {dateLongue(actualite.publie_le)}
            {actualite.auteur && ` · Par ${actualite.auteur}`}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary">
            Lire l&apos;article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
  );
};

ALaUne.propTypes = { actualite: ActualiteCard.propTypes.actualite };

const Actualites = () => {
  const { donnees: actualites, chargement, erreur } = useApi(getActualites, "liste");

  useEffect(() => {
    document.title = "Actualités | IE237";
    const meta = document.querySelector('head > meta[name="description"]');
    if (meta) {
      meta.content = "Toute l'actualité du Think-Do Tank IE237 : activités, formations, partenariats et prises de position.";
    }
  }, []);

  const [premiere, ...suivantes] = actualites || [];

  return (
      <div className="w-full min-h-screen overflow-x-hidden bg-background">
        <Header hero={false} />

        <main className="w-full text-body">
          <Conteneur className="pb-10 pt-14 sm:pt-20">
            <RevealOnScroll>
              <div className="max-w-2xl">
                <h1 className="m-0 text-[40px] font-bold leading-[1.06] tracking-[-0.03em] text-heading sm:text-[52px]">Actualités</h1>
                <p className="m-0 mt-4 text-[17px] leading-7 text-body">
                  Activités, formations, partenariats et prises de position du Think-Do Tank IE237 et de ses experts.
                </p>
              </div>
            </RevealOnScroll>
          </Conteneur>

          <Conteneur className="pb-20">
            {chargement && (
                <div className="flex justify-center py-16">
                  <ChargementLogo libelle="Chargement des actualités" />
                </div>
            )}

            {!chargement && (erreur || !actualites?.length) && (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-border px-6 py-16 text-center">
                  <Newspaper className="h-10 w-10 text-primary" />
                  <p className="m-0 text-base text-body">
                    {erreur
                        ? "Les actualités ne peuvent pas être chargées pour le moment. Réessayez dans quelques instants."
                        : "Aucune actualité publiée pour le moment."}
                  </p>
                </div>
            )}

            {premiere && (
                <RevealOnScroll>
                  <ALaUne actualite={premiere} />
                </RevealOnScroll>
            )}

            {suivantes.length > 0 && (
                <>
                  <h2 className="m-0 mb-6 mt-16 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Toutes les actualités
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {suivantes.map((a, i) => (
                        <RevealOnScroll key={a.id} delay={(i % 3) * 100} className="h-full">
                          <ActualiteCard actualite={a} />
                        </RevealOnScroll>
                    ))}
                  </div>
                </>
            )}
          </Conteneur>
        </main>

        <Footer />
      </div>
  );
};

export default Actualites;
