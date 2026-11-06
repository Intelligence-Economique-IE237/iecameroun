import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import RevealOnScroll from "../RevealOnScroll";
import { EnteteSection, Etiquette, Section } from "../ui";
import { STATUT_LABEL, statutEvenement } from "../../data/evenements";
import { useListeEvenements } from "../../data/evenements/depuisApi";

const PASTILLE = {
  "en-cours": "bg-primary",
  "a-venir": "bg-tertiary",
  passe: "bg-[#BDBDBD]",
};

// Liste compacte des derniers événements
const Evenements = () => {
  const listeEvenements = useListeEvenements();
  if (!listeEvenements.length) return null;
  return (
      <Section id="evenements" className="bg-primary/5">
        <EnteteSection
            titre="Événements"
            texte="Formations, conférences et rencontres institutionnelles organisées par IE237."
            action={
              <Link to="/evenements" className="inline-flex shrink-0 items-center gap-1.5 text-[15px] text-heading no-underline hover:text-primary">
                Tous les événements <ArrowRight className="h-4 w-4" />
              </Link>
            }
        />
        <div className="divide-y divide-border border-y border-border">
          {listeEvenements.slice(0, 4).map((evt, i) => {
            const statut = statutEvenement(evt);
            const vignette = evt.couverture ?? evt.galerie?.[0]?.src;
            return (
                <RevealOnScroll key={evt.slug} delay={i * 80}>
                <Link
                    to={`/evenements/${evt.slug}`}
                    className="group grid gap-3 py-5 no-underline sm:grid-cols-[112px_160px_1fr_auto] sm:items-center sm:gap-8"
                >
                  <div className="hidden overflow-hidden rounded-lg border border-border sm:block">
                    {vignette ? (
                        <img src={vignette} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                    ) : (
                        <div className="grid aspect-[4/3] place-items-center">
                          <img src="/logo-ie237.svg" alt="" className="h-9 w-9 opacity-60 grayscale" />
                        </div>
                    )}
                  </div>
                  <div>
                    <Etiquette>{evt.type}</Etiquette>
                    <p className="m-0 mt-1 text-[18px] font-medium tracking-[-0.02em] text-heading">{evt.sigle}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 text-[15px] leading-6 text-heading">{evt.titre}</p>
                    <p className="m-0 mt-1 text-[13px] text-muted">
                      {evt.dates} · {evt.lieu}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[13px] text-body">
                    <span className={`h-2 w-2 rounded-full ${PASTILLE[statut]}`} />
                    {STATUT_LABEL[statut]}
                    <ArrowRight className="ml-2 h-4 w-4 text-heading transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
                </RevealOnScroll>
            );
          })}
        </div>
      </Section>
  );
};

export default Evenements;
