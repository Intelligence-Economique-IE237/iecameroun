import PropTypes from "prop-types";
import RevealOnScroll from "./RevealOnScroll";

const piliers = [
  {
    number: "01",
    title: "Veille stratégique",
    description:
        "Vous aider à anticiper les évolutions de marché et surveiller votre environnement.",
  },
  {
    number: "02",
    title: "Innovation technologique",
    description:
        "Vous accompagner dans la création de nouvelles solutions et de nouveaux procédés pour faire la différence.",
  },
  {
    number: "03",
    title: "Influence & lobbying",
    description:
        "Vous aider à défendre vos intérêts et à orienter les décisions dans votre environnement réglementaire.",
  },
  {
    number: "04",
    title: "Sécurité de l'activité",
    description:
        "Contribuer à la protection de vos actifs, de vos données et de vos ressources stratégiques.",
  },
];

const services = [
  {
    number: "01",
    title: "Veille & analyse concurrentielle",
    tagline: "Anticiper les évolutions de votre marché avant vos concurrents.",
    badge: "Service phare",
    presentation:
        "Dans un environnement économique en mutation permanente, la veille stratégique constitue le socle de toute démarche d'intelligence économique. Notre service de veille vous permet de surveiller en continu votre environnement concurrentiel, technologique et réglementaire, afin de prendre des décisions éclairées et proactives.",
    items: [
      "Surveillance de l'environnement concurrentiel, technologique et réglementaire",
      "Identification des opportunités émergentes et évaluation des menaces",
      "Cartographie des parties prenantes et des acteurs clés du marché",
      "Analyse approfondie des stratégies, produits et services concurrents",
      "Benchmarking des pratiques du marché et positionnement comparatif",
      "Livrables : notes de veille périodiques, tableaux de bord, rapports d'analyse",
    ],
    valeur:
        "Vous disposez d'une vision à 360° de votre secteur et anticipez les évolutions avant qu'elles ne vous affectent.",
  },
  {
    number: "02",
    title: "Due diligence & enquêtes d'intégrité",
    tagline: "Vérifier l'intégrité de vos partenaires avant tout engagement.",
    badge: "Conformité",
    presentation:
        "Toute relation commerciale engage votre responsabilité. Avant de contracter avec un fournisseur, un sous-traitant, un distributeur ou un partenaire stratégique, notre service de due diligence vous apporte les garanties nécessaires pour éviter les risques juridiques, financiers et réputationnels.",
    items: [
      "Audit de la situation juridique, financière et réputationnelle de vos intermédiaires",
      "Vérification de la cohérence des parcours et antécédents déclarés",
      "Détection des signaux d'alerte : liens douteux, conflits d'intérêts, sanctions",
      "Évaluation de la conformité aux réglementations anticorruption",
      "Analyse des risques avant implantation dans un nouveau pays ou secteur",
      "Rapport confidentiel remis dans un cadre juridiquement sécurisé",
    ],
    valeur:
        "Vous contractez en connaissance de cause et protégez votre organisation contre des partenaires à risque.",
  },
  {
    number: "03",
    title: "OSINT & renseignement en sources ouvertes",
    tagline: "Exploiter légalement la mine d'or des données publiques.",
    badge: "Méthode différenciante",
    presentation:
        "L'OSINT (Open Source Intelligence) désigne la collecte et l'analyse d'informations issues de sources légalement accessibles : bases de données publiques, réseaux sociaux, registres officiels, presse spécialisée, forums sectoriels. Pratiqué de façon professionnelle, il constitue un avantage concurrentiel redoutable.",
    items: [
      "Collecte structurée d'informations en sources ouvertes (OSINT)",
      "Veille sur les réseaux sociaux et les médias numériques",
      "Cartographie des réseaux d'influence et des écosystèmes d'acteurs",
      "Recherche sur les individus, entités et marques (réputation, mentions, alertes)",
      "Analyse de la désinformation et des narratifs adverses",
      "Formation de vos équipes aux méthodes et outils OSINT opérationnels",
    ],
    valeur:
        "Vous exploitez des sources légales souvent sous-utilisées pour générer une intelligence à haute valeur ajoutée.",
  },
  {
    number: "04",
    title: "Innovation & veille technologique",
    tagline: "Transformer l'information en nouvelles solutions.",
    badge: "Innovation",
    presentation:
        "Innover suppose de savoir ce qui existe déjà, ce qui émerge et ce qui reste à inventer. Notre service vous accompagne dans l'identification des technologies porteuses et dans la création de nouvelles solutions et de nouveaux procédés pour faire la différence sur votre marché.",
    items: [
      "Veille technologique et suivi des innovations de votre secteur",
      "Recherche d'antériorité et analyse de brevets",
      "Identification de partenaires technologiques, start-up et centres de recherche",
      "Ateliers de conception de nouveaux produits, services ou procédés",
      "Livrables : cartographies d'innovation, feuilles de route, produits minimum viables (MVP), produits finaux",
    ],
    valeur:
        "Vous investissez dans les bonnes technologies au bon moment et protégez vos innovations.",
  },
  {
    number: "05",
    title: "Influence & lobbying",
    tagline: "Défendre vos intérêts là où se prennent les décisions.",
    badge: "Affaires publiques",
    presentation:
        "Les décisions publiques et réglementaires ont un impact direct sur votre activité. Notre service d'influence vous aide à identifier les bons interlocuteurs, à comprendre les circuits de décision et à porter vos positions de manière légitime et transparente.",
    items: [
      "Cartographie des décideurs, institutions et circuits de décision",
      "Veille législative et réglementaire",
      "Rédaction d'argumentaires",
      "Stratégie de communication d'influence et gestion de la réputation",
      "Accompagnement dans le dialogue avec les pouvoirs publics et les organisations professionnelles",
      "Anticipation et gestion des crises d'image",
    ],
    valeur:
        "Vos intérêts sont pris en compte en amont des décisions, plutôt que subis une fois celles-ci adoptées.",
  },
  {
    number: "06",
    title: "Formation & accompagnement à la décision",
    tagline: "Ancrer la culture de l'intelligence économique dans vos équipes.",
    badge: "Renforcement des capacités",
    presentation:
        "L'intelligence économique n'est pas seulement une prestation externalisée, mais aussi une compétence interne à développer. Nos programmes de formation sont conçus pour vos décideurs, managers et équipes opérationnelles, en présentiel ou à distance.",
    items: [
      "Sensibilisation aux fondamentaux de l'intelligence économique",
      "Formation aux outils de veille et d'analyse documentaire",
      "Ateliers pratiques sur l'OSINT et la collecte d'informations",
      "Coaching stratégique pour la prise de décision en environnement incertain",
      "Sensibilisation aux risques-pays et à la sécurité informationnelle",
      "Programme sur mesure selon vos secteurs d'activité et vos enjeux spécifiques",
    ],
    valeur:
        "Vos équipes deviennent autonomes dans la détection et l'analyse des signaux stratégiques qui concernent votre activité.",
  },
];

const ServicesSection = ({ className = "" }) => {
  return (
      <section
          className={`relative w-full bg-background py-16 md:py-20 px-6 sm:px-10 lg:px-[129px] text-left text-xl text-heading font-[Manrope] ${className}`}
      >
        <div
            className="max-w-[1440px] mx-auto flex flex-col gap-16"
            id="offres-services"
        >
          <div className="max-w-[720px] flex flex-col gap-3">
            <b className="uppercase text-sm text-primary tracking-wide">
              Nos offres de services
            </b>

            <h1 className="m-0 text-[28px] sm:text-[32px] lg:text-[40px] tracking-[-0.03em] leading-tight font-extrabold text-heading">
              La performance de votre organisation moyennant un dispositif d'Intelligence Économique competitif et adapté à vos besoins.
            </h1>

            <p className="m-0 text-base text-body">
              Quatre piliers d'action.
            </p>
          </div>

          {piliers.map((p, index) => (
              <RevealOnScroll
                  key={p.number}
                  delay={index * 120}
              >

                <div
                    className="
        rounded-2xl
        border border-border
        bg-surface
        p-6
        transition-all
        duration-300
        hover:border-primary
        hover:shadow-md
      "
                >

      <span className="text-sm font-bold text-primary">
        {p.number} —
      </span>

                  <h3 className="mt-3 text-lg font-bold text-heading">
                    {p.title}
                  </h3>

                  <p className="mt-2 text-sm text-body">
                    {p.description}
                  </p>

                </div>

              </RevealOnScroll>
          ))}

          <div className="flex flex-col gap-10">
            {services.map((s, index) => (
                <RevealOnScroll delay={index * 150}>
                <div
                    key={s.number}
                    className="rounded-2xl bg-surface border border-border p-6 sm:p-10 flex flex-col gap-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-4">
              <span className="text-sm font-bold text-primary shrink-0">
                {s.number}
              </span>

                      <div className="flex flex-col gap-1">
                        <h3 className="m-0 text-xl sm:text-2xl font-bold tracking-[-0.02em] text-heading">
                          {s.title}
                        </h3>

                        <p className="m-0 text-sm text-body">
                          {s.tagline}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 self-start sm:self-center rounded-full bg-secondary text-white text-xs font-semibold px-4 py-1.5">
              {s.badge}
            </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="m-0 text-sm font-bold uppercase tracking-wide text-heading">
                      Présentation
                    </h4>

                    <p className="m-0 text-base text-body leading-relaxed">
                      {s.presentation}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h4 className="m-0 text-sm font-bold uppercase tracking-wide text-heading">
                      Ce que nous faisons pour vous
                    </h4>

                    <ul className="m-0 pl-5 flex flex-col gap-2 list-disc marker:text-primary">
                      {s.items.map((item) => (
                          <li key={item} className="text-base text-body">
                            {item}
                          </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-tertiary-bg border border-tertiary-soft p-5">
                    <h4 className="m-0 text-sm font-bold uppercase tracking-wide text-primary">
                      Valeur ajoutée
                    </h4>

                    <p className="mt-2 text-base text-body">
                      {s.valeur}
                    </p>
                  </div>
                </div>
                </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
  );
};

ServicesSection.propTypes = {
  className: PropTypes.string,
};

export default ServicesSection;