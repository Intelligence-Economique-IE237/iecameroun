import { useEffect } from "react";
import { Loader2, Newspaper } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RevealOnScroll from "../components/RevealOnScroll";
import ActualiteCard from "../components/ActualiteCard";
import { getActualites, useApi } from "../api";

const SECTION_X = "px-5 sm:px-10 lg:px-24 xl:px-36";

const Actualites = () => {
  const { donnees: actualites, chargement, erreur } = useApi(getActualites, "liste");

  useEffect(() => {
    document.title = "Actualités | IE237";
    const meta = document.querySelector('head > meta[name="description"]');
    if (meta) {
      meta.content = "Toute l'actualité du Think-Do Tank IE237 : activités, formations, partenariats et prises de position.";
    }
  }, []);

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
                  <span className="text-sm uppercase tracking-[0.2em] font-semibold text-primary">Actualités</span>
                  <h1 className="m-0 font-[Manrope] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-heading">
                    Nos actualités
                  </h1>
                  <div className="h-1 w-16 rounded-full bg-primary" />
                  <p className="m-0 text-lg sm:text-xl leading-8 text-body">
                    Activités, formations et prises de position du Think-Do Tank IE237.
                  </p>
                </div>
              </RevealOnScroll>
            </section>

            <section className={`${SECTION_X} py-12 sm:py-16`}>
              {chargement && (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Chargement" />
                  </div>
              )}

              {!chargement && (erreur || !actualites?.length) && (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
                    <Newspaper className="h-10 w-10 text-primary" />
                    <p className="m-0 text-base text-body">
                      {erreur
                          ? "Les actualités ne peuvent pas être chargées pour le moment. Réessayez dans quelques instants."
                          : "Aucune actualité publiée pour le moment."}
                    </p>
                  </div>
              )}

              {!!actualites?.length && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {actualites.map((a, i) => (
                        <RevealOnScroll key={a.id} delay={(i % 3) * 120}>
                          <ActualiteCard actualite={a} />
                        </RevealOnScroll>
                    ))}
                  </div>
              )}
            </section>
          </main>

          <Footer />
        </div>
      </div>
  );
};

export default Actualites;
