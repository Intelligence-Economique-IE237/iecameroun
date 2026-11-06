import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ActualiteCard from "../ActualiteCard";
import RevealOnScroll from "../RevealOnScroll";
import { EnteteSection, Section } from "../ui";
import { getActualites, useApi } from "../../api";

// Les 3 dernières actualités publiées. Section masquée s'il n'y en a aucune.
const Actualites = () => {
  const { donnees } = useApi(getActualites, "accueil");
  if (!donnees?.length) return null;

  return (
      <Section id="actualites">
        <EnteteSection
            titre="Dernières actualités"
            texte="Les activités, formations et prises de position les plus récentes du Think-Do Tank."
            action={
              <Link
                  to="/actualites"
                  className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-primary no-underline hover:underline"
              >
                Toutes les actualités <ArrowRight className="h-4 w-4" />
              </Link>
            }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {donnees.slice(0, 3).map((a, i) => (
              <RevealOnScroll key={a.id} delay={i * 100} className="h-full">
                <ActualiteCard actualite={a} />
              </RevealOnScroll>
          ))}
        </div>
      </Section>
  );
};

export default Actualites;
