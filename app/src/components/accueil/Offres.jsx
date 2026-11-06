import { Check, FileSignature, Plus } from "lucide-react";
import RevealOnScroll from "../RevealOnScroll";
import { EnteteSection, Etiquette, Section, classeBouton } from "../ui";
import { images, services } from "../../data/contenu";

// Demande de devis : ouvre la messagerie avec un objet et un modèle de message à compléter
const EMAIL_DEVIS = "contact@iecameroun.cm";
export const lienDevis = (offre) => {
  const objet = offre ? `Demande de devis : ${offre}` : "Demande de devis";
  const corps = [
    "Bonjour,",
    "",
    offre ? `Nous souhaitons recevoir un devis pour l'offre « ${offre} ».` : "Nous souhaitons recevoir un devis pour un accompagnement IE237.",
    "",
    "Organisation :",
    "Secteur d'activité :",
    "Notre besoin en quelques lignes :",
    "Échéance souhaitée :",
    "Téléphone :",
    "",
    "Cordialement,",
  ].join("\n");
  return `mailto:${EMAIL_DEVIS}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
};

// Chaque offre se déplie (élément <details> natif : accessible, sans JavaScript)
const Offres = () => (
    <Section id="offres-services" className="bg-primary/4">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <EnteteSection
              className="!mb-0"
              titre="Nos offres de services"
              texte="Six prestations pour surveiller votre environnement, sécuriser vos décisions et défendre vos intérêts. Dépliez une offre pour en voir le détail."
          />
          <RevealOnScroll delay={100} className="mt-6">
            <a href={lienDevis()} className={classeBouton()}>
              <FileSignature className="h-4 w-4" />
              Demander un devis
            </a>
            <p className="m-0 mt-2 text-[13px] text-muted">Décrivez votre besoin : nous revenons vers vous avec une proposition adaptée.</p>
          </RevealOnScroll>
          <RevealOnScroll delay={150} className="mt-8 overflow-hidden rounded-lg border border-border">
            <img src={images.offres.src} alt={images.offres.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </RevealOnScroll>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {services.map((s, i) => (
              <RevealOnScroll key={s.title} delay={i * 60}>
              <details className="depliant group py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 transition-colors hover:[&_h3]:text-primary">
                  <div>
                    <Etiquette>{s.badge}</Etiquette>
                    <h3 className="m-0 mt-1.5 text-[18px] font-bold tracking-[-0.02em] text-heading">{s.title}</h3>
                    <p className="m-0 mt-1 text-[15px] leading-6 text-body">{s.tagline}</p>
                  </div>
                  <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-heading transition-transform duration-200 group-open:rotate-45">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>

                <div className="mt-5 flex flex-col gap-4 text-[15px] leading-7 text-body">
                  <p className="m-0">{s.presentation}</p>
                  <ul className="m-0 grid list-none gap-2 p-0">
                    {s.items.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <Check className="mt-1.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{item}</span>
                        </li>
                    ))}
                  </ul>
                  <p className="m-0 border-l-2 border-primary pl-4 text-heading">
                    <span className="font-medium">Valeur ajoutée. </span>
                    {s.valeur}
                  </p>
                  <div>
                    <a href={lienDevis(s.title)} className={classeBouton()}>
                      <FileSignature className="h-4 w-4" />
                      Demander un devis pour cette offre
                    </a>
                  </div>
                </div>
              </details>
              </RevealOnScroll>
          ))}
        </div>
      </div>
    </Section>
);

export default Offres;
