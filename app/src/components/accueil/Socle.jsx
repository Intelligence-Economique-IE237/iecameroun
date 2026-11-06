import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import RevealOnScroll from "../RevealOnScroll";
import { ACCENTS, Carte, EnteteSection, Etiquette, Section } from "../ui";
import { handleAnchorClick } from "../../utils/scrollToSection";
import { piliers } from "../../data/contenu";

const Socle = () => {
  const navigate = useNavigate();
  return (
      <Section id="socle">
        <EnteteSection
            titre="Quatre piliers d'action"
            texte="La performance de votre organisation repose sur un dispositif d'intelligence économique compétitif et adapté à vos besoins."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {piliers.map((p, i) => (
              <RevealOnScroll key={p.title} delay={i * 90} className="h-full">
              <Carte className="group flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 z-[1] h-[3px] ${ACCENTS[i % ACCENTS.length]}`} />
                  <img
                      src={p.image}
                      alt={p.imageAlt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                <Etiquette>Pilier {p.number}</Etiquette>
                <h3 className="m-0 mt-4 text-[18px] font-bold leading-snug tracking-[-0.02em] text-heading">{p.title}</h3>
                <p className="m-0 mt-2 flex-1 text-[15px] leading-6 text-body">{p.description}</p>
                <a
                    href="/#offres-services"
                    onClick={(e) => handleAnchorClick(e, "offres-services", navigate)}
                    className="mt-8 inline-flex items-center justify-between border-t border-border pt-4 text-[14px] text-heading no-underline hover:text-primary"
                >
                  Voir les offres
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-border">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
                </div>
              </Carte>
              </RevealOnScroll>
          ))}
        </div>
      </Section>
  );
};

export default Socle;
