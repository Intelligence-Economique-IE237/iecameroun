import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import ActualiteCard from "./ActualiteCard";
import RevealOnScroll from "./RevealOnScroll";
import { getActualites, useApi } from "../api";

// Section de l'accueil : les 3 dernières actualités publiées.
// Masquée tant qu'aucune actualité n'est publiée (ou si l'API ne répond pas).
const DernieresActualites = () => {
  const { donnees: actualites } = useApi(getActualites, "accueil");
  if (!actualites?.length) return null;

  return (
      <section id="actualites" className="scroll-mt-24 px-5 sm:px-10 lg:px-24 xl:px-36 mt-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-sm uppercase tracking-[0.2em] font-semibold text-primary">Actualités</span>
            <h2 className="m-0 text-center lg:text-left text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-heading">
              Les dernières nouvelles du Think-Do Tank
            </h2>
          </div>
          <Link
              to="/actualites"
              className="inline-flex shrink-0 items-center gap-1.5 self-center sm:self-auto text-sm font-semibold text-primary no-underline hover:text-primary-hover"
          >
            Toutes les actualités
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {actualites.slice(0, 3).map((a, i) => (
              <RevealOnScroll key={a.id} delay={i * 120}>
                <ActualiteCard actualite={a} />
              </RevealOnScroll>
          ))}
        </div>
      </section>
  );
};

export default DernieresActualites;
