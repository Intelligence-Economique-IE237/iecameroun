import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const domains = [
    { title: "Intelligence Économique & Analyse stratégique", image: "macro.avif" },
    { title: "Macroéconomie", image: "/macro.avif" },
    { title: "Sécurité & Défense", image: "/securite-banque-_BD.jpg" },
    { title: "Communication", image: "/IMG_4124.JPG.jpeg" },
    { title: "Ingénierie informatique", image: "/pexels-nemuel-6424586.webp" },
    { title: "Sciences politiques et juridiques", image: "/SCIENCE JURIDIQUE.webp" },
    { title: "Relations Internationales", image: "/drapeaux-ri-africains.jpg" },
];

const AUTOPLAY_MS = 4000;

const AboutUs = ({ className = "" }) => {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setActive((v) => (v + 1) % domains.length);
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, []);

    return (
        <section
            id="a-propos"
            className={`w-full bg-background py-20 px-6 sm:px-10 lg:px-16 ${className}`}
        >
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Texte */}
                <div className="flex flex-col gap-12">
                    <div className="flex flex-col gap-4">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">
              À propos de nous
            </span>
                        <h2 className="text-heading text-3xl lg:text-5xl font-bold leading-tight m-0">
                            Qui sommes-nous ?
                        </h2>
                        <div className="w-20 h-1 bg-primary rounded-full" />
                        <p className="text-body text-lg leading-relaxed max-w-xl m-0">
                            IE237 réunit une équipe pluridisciplinaire d'experts engagés dans
                            l'analyse stratégique, la veille, l'innovation, l'influence et la protection des
                            intérêts économiques nationaux.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {domains.map((domain, index) => (
                            <button
                                key={domain.title}
                                type="button"
                                onClick={() => setActive(index)}
                                className={`group text-left rounded-2xl border p-5 transition-all duration-300 ${
                                    active === index
                                        ? "border-secondary shadow-md bg-surface"
                                        : "border-border bg-surface hover:border-secondary hover:shadow-md"
                                }`}
                            >
                                <div className="flex items-start gap-4">
                  <span
                      className={`font-bold text-2xl shrink-0 transition-colors ${
                          active === index ? "text-secondary" : "text-secondary"
                      }`}
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                                    <h3 className="text-heading text-base font-semibold leading-relaxed m-0 group-hover:text-primary transition-colors">
                                        {domain.title}
                                    </h3>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Slide synchronisée */}
                <div className="relative lg:sticky lg:top-24">
                    <div className="relative rounded-3xl overflow-hidden shadow-md h-[420px] lg:h-[560px]">
                        {domains.map((domain, index) => (
                            <img
                                key={domain.image}
                                src={domain.image}
                                alt={domain.title}
                                loading={index === 0 ? "eager" : "lazy"}
                                decoding="async"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                                    active === index ? "opacity-100" : "opacity-0"
                                }`}
                            />
                        ))}
                    </div>

                    <div className="absolute -bottom-6 left-6 flex items-center gap-2 rounded-2xl bg-surface border border-border px-3 py-2 shadow-md">
                        {domains.map((domain, index) => (
                            <button
                                key={domain.title}
                                type="button"
                                onClick={() => setActive(index)}
                                aria-label={domain.title}
                                className={`h-8 w-8 rounded-full text-xs font-semibold transition-colors duration-250 ${
                                    active === index
                                        ? "bg-secondary text-background"
                                        : "text-muted hover:text-secondary"
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

AboutUs.propTypes = {
    className: PropTypes.string,
};

export default AboutUs;