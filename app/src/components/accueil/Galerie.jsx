import RevealOnScroll from "../RevealOnScroll";
import { EnteteSection, Section } from "../ui";
import { legende, photos } from "../../data/contenu";

const Galerie = () => (
    <Section id="galerie">
      <EnteteSection titre="Galerie" texte="Conférences, formations et rencontres institutionnelles au cœur de notre activité." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {photos.map((p, i) => (
            <RevealOnScroll
                key={p.src}
                delay={(i % 4) * 80}
                className={i === 0 ? "col-span-2 row-span-2" : i === photos.length - 1 ? "col-span-2" : ""}
            >
            <figure className="group m-0">
              <a href={p.src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-border">
                <img
                    src={p.vignette}
                    alt={legende(p) || "Photo d'une activité d'IE237"}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${i === 0 ? "aspect-square" : i === photos.length - 1 ? "aspect-[8/3]" : "aspect-[4/3]"}`}
                />
              </a>
              {legende(p) && <figcaption className="mt-2 text-[13px] leading-5 text-muted">{legende(p)}</figcaption>}
            </figure>
            </RevealOnScroll>
        ))}
      </div>
    </Section>
);

export default Galerie;
