import PropTypes from "prop-types";
import CountUp from "./CountUp";


const stats = [
  { value: "+18000", label: "Personnes touchées" },
  { value: "+100", label: "Notes d'analyse,\nde veille économique" },
  { value: "+6", label: "Logiciels d'intelligence économique" },
];
const logosRow1 = [
  "/logo_cavie_transparent.png.webp",
  "/IRIC_Yaoundé_Logo.png",
  "/CRTV_logo_2017.png",
  "/logo-minfof.webp",
  "/logo-univ-dschang.png",
  "/seal.png",
  "/Gpe.png",
  "/inst-minjec-CRnim7E5.png",
  "/images1.png",
  "/images2.png",
  "/images3.png",
  "/minat.svg",
  "/1630541193691.jpg",
  "/1599039119.jpg",
  "/images8.png",
  "/minddevel.png",
];

const logosRow2 = [
  "/logo-minsante-e1760528201942.png",
  "/logo_minepat.png",
  "/logo_mincommerce.png",
  "/logo_minmap.png",
  "/MINREX.png",
  "/minat.svg",
  "/logo-1.png",
  "/logo_minmap.png",
  "/images4.png",
  "/images5.png",
  "/images6.png",
  "/minddevel.png",
  "/images7.png",
  "/DGSN-logo.jpg",
  "/1592432400.jpg",
  "/4XXEPIvK_400x400.jpg",
  "/Gpe.png",
];

const ServicesFunFacts = ({ className = "" }) => {
  return (
      <section
          className={`relative w-full bg-surface bg-[url('/Frame@3x.png')] bg-cover bg-center py-16 md:py-20 px-6 sm:px-10 lg:px-[113px] font-[Poppins] ${className}`}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-12">

          {/* Présentation Impact */}
          <div className="flex flex-col gap-4 max-w-[460px]">

      <span className="text-sm uppercase tracking-[0.2em] font-semibold text-primary">
        Notre Impact
      </span>

            <h1
                className="m-0 text-[28px] sm:text-2xl lg:text-3xl
        tracking-[-0.03em] leading-tight font-bold text-heading"
            >
              Une intelligence économique au service de la souveraineté nationale
            </h1>

            <span className="w-14 h-1 bg-primary rounded-full" />

            <p
                className="text-base lg:text-lg
        tracking-[-0.02em] leading-relaxed text-body"
            >
              <strong className="text-heading">
                L'émergence
              </strong>{" "}
              d'une Intelligence Économique camerounaise au service du développement
              économique et de la souveraineté nationale.
            </p>

          </div>


          {/* Statistiques */}
          <div className="flex flex-wrap gap-8 sm:gap-12 text-heading">

            {stats.map((s, index) => (
                <div
                    key={s.value + s.label}
                    className="flex flex-col gap-2 min-w-[150px]"
                >

                  <h2
                      className="
          m-0
          text-3xl lg:text-4xl
          font-bold
          tracking-tight
          text-primary
        "
                  >
                    +
                    <CountUp
                        value={Number(s.value)}
                        duration={2000 + index * 500}
                    />

                  </h2>


                  <div
                      className="
          text-sm lg:text-base
          leading-relaxed
          text-body
          whitespace-pre-line
        "
                  >
                    {s.label}
                  </div>

                </div>
            ))}

          </div>

        </div>


        {/* Partenaires */}
        <div className="mt-20">

          <div className="flex flex-col items-center gap-3 mb-12">

            <h3
                className="text-2xl lg:text-3xl
        font-bold tracking-tight text-heading"
            >
              Ils nous font confiance
            </h3>

            <span className="h-1 w-16 bg-primary rounded-full" />

          </div>


          <div className="w-full overflow-hidden flex flex-col gap-10">

            {/* Ligne 1 */}
            <div className="flex overflow-hidden">
              <div className="flex gap-12 animate-scroll-left shrink-0">

                {[...logosRow1, ...logosRow1].map((logo, i) => (
                    <img
                        key={`row1-${i}`}
                        className="
                h-10 sm:h-12 lg:h-14
                w-auto object-contain shrink-0
                opacity-80 hover:opacity-100
                transition-opacity duration-300
              "
                        loading="lazy"
                        alt=""
                        src={logo}
                    />
                ))}

              </div>
            </div>


            {/* Ligne 2 */}
            <div className="flex overflow-hidden">
              <div className="flex gap-12 animate-scroll-right shrink-0">

                {[...logosRow2, ...logosRow2].map((logo, i) => (
                    <img
                        key={`row2-${i}`}
                        className="
                h-10 sm:h-12 lg:h-14
                w-auto object-contain shrink-0
                opacity-80 hover:opacity-100
                transition-opacity duration-300
              "
                        loading="lazy"
                        alt=""
                        src={logo}
                    />
                ))}

              </div>
            </div>

          </div>

        </div>

      </section>
  );
};

ServicesFunFacts.propTypes = {
  className: PropTypes.string,
};

export default ServicesFunFacts;
