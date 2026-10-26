import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import PageContainer from "./pages/PageContainer";
import Evenements from "./pages/Evenements";
import Evenement from "./pages/Evenement";

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
      <Route path="/evenements" element={<Evenements />} />
      <Route path="/evenements/:slug" element={<Evenement />} />
      {/* Ancienne adresse de la page MOPIET */}
      <Route path="/mopiet-2026" element={<Navigate to="/evenements/mopiet-2026" replace />} />
    </Routes>
  );
}
export default App;
