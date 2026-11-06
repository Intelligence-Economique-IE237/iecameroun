import { ArrowRight } from "lucide-react";
import { CONTACT } from "../Header";
import RevealOnScroll from "../RevealOnScroll";
import { Section, classeBouton } from "../ui";
import { images } from "../../data/contenu";

const AppelFinal = () => (
    <Section className="text-center">
      <RevealOnScroll className="mb-12 overflow-hidden rounded-lg border border-border">
        <img src={images.appel.src} alt={images.appel.alt} loading="lazy" className="aspect-[21/9] w-full object-cover" />
      </RevealOnScroll>
      <RevealOnScroll>
      <h2 className="m-0 mx-auto max-w-3xl text-[32px] sm:text-[44px] font-medium leading-[1.12] tracking-[-0.03em] text-heading">
        Échangeons sur vos enjeux en intelligence économique
      </h2>
      <p className="m-0 mx-auto mt-4 max-w-xl text-[15px] leading-6 text-body">
        Institutions, entreprises, investisseurs : écrivez-nous pour une première prise de contact.
      </p>
      <a href={CONTACT} className={`${classeBouton()} mt-8`}>
        contact@iecameroun.cm <ArrowRight className="h-4 w-4" />
      </a>
      </RevealOnScroll>
    </Section>
);

export default AppelFinal;
