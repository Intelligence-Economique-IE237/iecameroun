import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import PageContainer from "./pages/PageContainer";
import Mopiet2026 from "./pages/Mopiet2026";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "";
        metaDescription = "";
        break;
      case "/mopiet-2026":
        title = "MOPIET 2026 – Chronogramme | IE237";
        metaDescription =
          "Programme de la session de formation MOPIET 2026 sur les Méthodes et Outils Pratiques d'Intelligence Économique Territoriale, du 26 au 30 octobre 2026 à Yaoundé.";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag = document.querySelector(
        'head > meta[name="description"]',
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<PageContainer />} />
      <Route path="/mopiet-2026" element={<Mopiet2026 />} />
    </Routes>
  );
}
export default App;
