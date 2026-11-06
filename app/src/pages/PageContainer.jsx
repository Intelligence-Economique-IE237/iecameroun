import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Ouverture from "../components/accueil/Ouverture";
import Partenaires from "../components/accueil/Partenaires";
import Socle from "../components/accueil/Socle";
import Offres from "../components/accueil/Offres";
import Economie from "../components/accueil/Economie";
import Publications from "../components/accueil/Publications";
import Actualites from "../components/accueil/Actualites";
import Evenements from "../components/accueil/Evenements";
import APropos from "../components/accueil/APropos";
import Galerie from "../components/accueil/Galerie";
import AppelFinal from "../components/accueil/AppelFinal";

// Page d'accueil
const PageContainer = () => {
  useEffect(() => {
    document.title = "IE237 | Un Think-Do Tank républicain";
  }, []);

  return (
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <Header />
        <main>
          <Ouverture />
          <Partenaires />
          <Socle />
          <Offres />
          <Economie />
          <Publications />
          <Actualites />
          <Evenements />
          <APropos />
          <Galerie />
          <AppelFinal />
        </main>
        <Footer />
      </div>
  );
};

export default PageContainer;
