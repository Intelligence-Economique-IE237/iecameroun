import { Download, ExternalLink } from "lucide-react";
import RevealOnScroll from "../RevealOnScroll";
import { EnteteSection, Etiquette, Section, couleurType } from "../ui";
import { dateLongue, getLivrables, urlFichier, useApi } from "../../api";
import { telecharger } from "../../utils/telechargement";

// Livrables publiés depuis le panneau admin, présentés comme une liste de documents
const Publications = () => {
  const { donnees, chargement, erreur } = useApi(getLivrables, "livrables");

  return (
      <Section id="publications" className="bg-primary/5">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <EnteteSection
              className="!mb-0 lg:sticky lg:top-24 lg:self-start"
              titre="Nos dernières productions ouvertes au public"
              texte="Études, notes de veille et fiches d'analyse produites par nos experts, en accès libre."
          />

          <div className="border-y border-border">
            {chargement &&
                [0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col gap-2.5 border-b border-border py-6 last:border-none">
                      <div className="h-3 w-16 animate-pulse rounded bg-[#EFEFEF]" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-[#EFEFEF]" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-[#EFEFEF]" />
                    </div>
                ))}

            {!chargement && (erreur || !donnees?.length) && (
                <p className="m-0 py-10 text-[15px] text-body">
                  {erreur
                      ? "Les publications ne peuvent pas être chargées pour le moment. Réessayez dans quelques instants."
                      : "Aucune publication pour le moment."}
                </p>
            )}

            {donnees?.map((l, i) => {
              const pdf = urlFichier(l.fichier);
              return (
                  <RevealOnScroll key={l.id} delay={i * 70} className="border-b border-border last:border-none">
                  <article className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-2">
                        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${couleurType(l.etiquette)}`} />
                        <Etiquette>{l.etiquette}</Etiquette>
                      </span>
                      <h3 className="m-0 mt-1.5 text-[18px] font-bold tracking-[-0.02em] text-heading">{l.titre}</h3>
                      {l.description && <p className="m-0 mt-1 text-[15px] leading-6 text-body">{l.description}</p>}
                      <p className="m-0 mt-2 text-[13px] text-muted">Publié le {dateLongue(l.publie_le)}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <a
                          href={pdf}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-[14px] text-heading no-underline hover:border-heading"
                      >
                        Lire <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                          type="button"
                          onClick={() => telecharger(pdf, `${l.titre}.pdf`)}
                          aria-label={`Télécharger ${l.titre}`}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none bg-primary px-4 py-2 text-[14px] text-white hover:bg-primary-hover"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </button>
                    </div>
                  </article>
                  </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </Section>
  );
};

export default Publications;
