import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import Mise from "./components/layout/Mise";
import Connexion from "./pages/Connexion";
import TableauDeBord from "./pages/TableauDeBord";
import ListeActualites from "./pages/actualites/ListeActualites";
import FormulaireActualite from "./pages/actualites/FormulaireActualite";
import ListeLivrables from "./pages/livrables/ListeLivrables";
import FormulaireLivrable from "./pages/livrables/FormulaireLivrable";
import Utilisateurs from "./pages/utilisateurs/Utilisateurs";
import PageIntrouvable from "./pages/PageIntrouvable";

// Redirige vers la connexion si personne n'est connecté
function Protege({ children }) {
  const { utilisateur, chargement } = useAuth();
  const location = useLocation();
  if (chargement) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!utilisateur) return <Navigate to="/connexion" replace state={{ depuis: location.pathname }} />;
  return children;
}

// Pages réservées au rôle Admin
function AdminSeulement({ children }) {
  const { estAdmin } = useAuth();
  return estAdmin ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route
        element={
          <Protege>
            <Mise />
          </Protege>
        }
      >
        <Route index element={<TableauDeBord />} />
        <Route path="actualites" element={<ListeActualites />} />
        <Route path="actualites/nouvelle" element={<FormulaireActualite />} />
        <Route path="actualites/:id" element={<FormulaireActualite />} />
        <Route path="livrables" element={<ListeLivrables />} />
        <Route path="livrables/nouveau" element={<FormulaireLivrable />} />
        <Route path="livrables/:id" element={<FormulaireLivrable />} />
        <Route
          path="utilisateurs"
          element={
            <AdminSeulement>
              <Utilisateurs />
            </AdminSeulement>
          }
        />
        <Route path="*" element={<PageIntrouvable />} />
      </Route>
    </Routes>
  );
}
