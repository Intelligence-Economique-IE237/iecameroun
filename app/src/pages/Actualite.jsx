import { useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RevealOnScroll from "../components/RevealOnScroll";
import { Introuvable, dateLongue, getActualite, urlFichier, useApi } from "../api";

const SECTION_X = "px-5 sm:px-10 lg:px-24 xl:px-36";

const Retour = () => (
    <Link to="/actualites" className="inline-flex items-center gap-2 text-sm font-semibold text-primary no-underline hover:text-primary-hover">
      <ArrowLeft className="h-4 w-4" />
      Toutes les actualités
    </Link>
);

// Le contenu est du texte brut : une ligne vide sépare deux paragraphes
const Paragraphes = ({ texte }) =>
    texte
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
            <p key={i} className="m-0 whitespace-pre-line">
              {p}
            </p>
        ));

Paragraphes.propTypes = { texte: PropTypes.string.isRequired };

const Actualite = () => {
  const { slug } = useParams();
  const { donnees: actualite, chargement, erreur } = useApi(() => getActualite(slug), slug);

  useEffect(() => {
    if (!actualite) return;
    document.title = `${actualite.titre} | IE237`;
    const meta = document.querySelector('head > meta[name="description"]');
    if (meta && actualite.resume) meta.content = actualite.resume;
  }, [actualite]);

  const image = urlFichier(actualite?.image);

  return (
      <div className="w-full min-h-screen overflow-x-hidden bg-background">
        <div className="mx-auto w-full max-w-[1440px]">
          <Header hero={false} />

          <main className="w-full text-body font-[Poppins]">
            {chargement && (
                <div className="flex justify-center py-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Chargement" />
                </div>
            )}

            {!chargement && erreur && (
                <section className={`${SECTION_X} py-20`}>
                  <div className="flex max-w-2xl flex-col gap-4">
                    <h1 className="m-0 text-3xl font-bold text-heading">
                      {erreur instanceof Introuvable ? "Actualité introuvable" : "Actualité indisponible"}
                    </h1>
                    <p className="m-0 text-base text-body">
                      {erreur instanceof Introuvable
                          ? "Cette actualité n'existe pas ou n'est plus publiée."
                          : "Elle ne peut pas être chargée pour le moment. Réessayez dans quelques instants."}
                    </p>
                    <Retour />
                  </div>
                </section>
            )}

            {actualite && (
                <article>
                  <header className={`relative bg-surface ${SECTION_X} py-12 sm:py-16`}>
                    <img
                        className="absolute left-0 top-0 w-48 sm:w-72 lg:w-[420px] opacity-40 pointer-events-none"
                        alt=""
                        src="/Ellipse-737.svg"
                    />
                    <RevealOnScroll>
                      <div className="relative flex max-w-4xl flex-col gap-4">
                        <Retour />
                        <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                          <CalendarDays className="h-4 w-4" />
                          {dateLongue(actualite.publie_le)}
                        </span>
                        <h1 className="m-0 font-[Manrope] text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-[-0.03em] text-heading">
                          {actualite.titre}
                        </h1>
                        <div className="h-1 w-16 rounded-full bg-primary" />
                        {actualite.resume && <p className="m-0 text-lg sm:text-xl leading-8 text-body">{actualite.resume}</p>}
                      </div>
                    </RevealOnScroll>
                  </header>

                  <div className={`${SECTION_X} py-12 sm:py-16`}>
                    <div className="mx-auto flex max-w-3xl flex-col gap-8">
                      {image && (
                          <img src={image} alt="" className="w-full rounded-2xl border border-border object-cover shadow-sm" />
                      )}
                      <div className="flex flex-col gap-5 text-base sm:text-lg leading-8 text-body">
                        <Paragraphes texte={actualite.contenu || ""} />
                      </div>
                      <div className="border-t border-border pt-6">
                        <Retour />
                      </div>
                    </div>
                  </div>
                </article>
            )}
          </main>

          <Footer />
        </div>
      </div>
  );
};

export default Actualite;
