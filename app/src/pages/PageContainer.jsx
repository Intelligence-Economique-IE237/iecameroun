import ServicesSection from "../components/ServicesSection";
import Footer from "../components/Footer";
import ServicesFunFacts from "../components/ServicesFunFacts";
import Header from "../components/Header";
import Livrables from "../components/LivrablesCard";
import AboutUs from "../components/AboutUs";
import Galery from "../components/Galery";

const PageContainer = () => {
  return (
      <div className="w-full min-h-screen overflow-x-hidden bg-background">
        <div className="mx-auto w-full max-w-[1440px]">

          <Header />

          {/*<img*/}
          {/*    src="/Group-1321314344.svg"*/}
          {/*    alt="Élément graphique IE237"*/}
          {/*    className="mx-auto my-8 w-[80%] max-w-[350px] h-auto object-contain px-4 sm:px-6"*/}
          {/*/>*/}


          <main className="w-full text-body font-[Poppins]">

            <ServicesFunFacts />


            {/* Vision */}
            <section
                className="flex w-full flex-col items-center gap-8 sm:gap-12 lg:gap-16
        px-5 sm:px-10 lg:px-24 xl:px-36
        py-12 sm:py-16 lg:py-20"
            >

              <div className="flex flex-col items-center gap-3">

          <span className="text-sm uppercase tracking-[0.2em] font-semibold text-primary">
            Notre vision
          </span>

                <h2
                    className="text-center font-[Manrope]
            text-3xl sm:text-4xl lg:text-5xl
            font-extrabold tracking-[-0.03em] text-heading"
                >
                  Construire une intelligence économique souveraine
                </h2>

                <div className="h-1 w-16 rounded-full bg-primary" />

              </div>

              <div
                  className="max-w-6xl space-y-6 text-justify
          text-base sm:text-lg lg:text-xl
          leading-8 text-body"
              >

                <p>
                  Dans un monde saturé de récits concurrents et de stratégies
                  d'influence, IE237 a été créé pour répondre aux défis de la guerre
                  économique, informationnelle et cognitive auxquels le continent
                  africain en général, et le Cameroun en particulier, sont confrontés.
                </p>


                <p>
                  Nous réunissons des experts en Intelligence Économique,
                  Macroéconomie, Analyse stratégique, Sécurité & Défense,
                  Communication, Sciences politiques et juridiques, Relations
                  Internationales et Ingénierie informatique.
                </p>


                <p>
                  Nous travaillons avec des institutions qui comprennent que la
                  souveraineté véritable ne se décrète pas du jour au lendemain.
                  Elle se pense, se construit et se défend dans la durée.
                </p>

              </div>

            </section>


            <ServicesSection />


            {/* Publications */}
            <section
                className="px-5 sm:px-10 lg:px-24 xl:px-36 mt-12"
            >

              <div className="flex flex-col gap-3">

          <span className="text-sm uppercase tracking-[0.2em] font-semibold text-primary">
            Publications
          </span>

                <h2
                    className="text-center lg:text-left
            text-2xl sm:text-3xl lg:text-4xl
            font-bold tracking-tight text-heading"
                >
                  Nos dernières productions ouvertes au public
                </h2>

              </div>

            </section>


            <div id="publications" className="scroll-mt-24" />

            <Livrables />


          </main>


          <div id="a-propos" className="scroll-mt-24" />


          <AboutUs />
            <Galery/>



          <Footer />


        </div>
      </div>
  );
};

export default PageContainer;