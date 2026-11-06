import RevealOnScroll from "../RevealOnScroll";
import { Etiquette, Section } from "../ui";
import { domaines, images } from "../../data/contenu";

const APropos = () => (
    <Section id="a-propos">
      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <RevealOnScroll>
          <h2 className="m-0 text-[32px] sm:text-[44px] font-medium leading-[1.12] tracking-[-0.03em] text-heading">
            Construire une intelligence économique souveraine
          </h2>
          <div className="mt-6 flex flex-col gap-5 text-[17px] leading-8 text-body">
            <p className="m-0">
              Dans un monde saturé de récits concurrents et de stratégies d&apos;influence, IE237 a été créé pour
              répondre aux défis de la guerre économique, informationnelle et cognitive auxquels le continent africain
              en général, et le Cameroun en particulier, sont confrontés.
            </p>
            <p className="m-0">
              Nous travaillons avec des institutions qui comprennent que la souveraineté véritable ne se décrète pas du
              jour au lendemain. Elle se pense, se construit et se défend dans la durée.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {images.aPropos.map((img) => (
                <div key={img.src} className="group overflow-hidden rounded-lg border border-border">
                  <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={120}>
          <Etiquette>Nos domaines d&apos;expertise</Etiquette>
          <ul className="m-0 mt-4 list-none divide-y divide-border border-y border-border p-0">
            {domaines.map((d) => (
                <li key={d.title} className="py-3 text-[15px] text-heading">
                  {d.title}
                </li>
            ))}
          </ul>
          <p className="m-0 mt-4 text-[13px] text-muted">Siège : Bastos, Yaoundé, Cameroun</p>
        </RevealOnScroll>
      </div>
    </Section>
);

export default APropos;
