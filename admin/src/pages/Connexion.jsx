import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Alerte from "../components/ui/Alerte";
import { Champ } from "../components/ui/Champ";
import SelecteurLangue from "../traduction/SelecteurLangue";

export default function Connexion() {
  const { utilisateur, connecter, sessionExpiree } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  if (utilisateur) return <Navigate to="/" replace />;

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      await connecter(email.trim(), motDePasse);
      navigate(location.state?.depuis || "/", { replace: true });
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <SelecteurLangue className="mb-6 items-center" />
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/logo-ie237.svg" alt="IE237" className="size-16" />
          <h1 className="mt-4 text-xl font-semibold text-heading">Administration IE237</h1>
          <p className="mt-1 text-sm text-muted">Connectez-vous pour gérer le contenu du site.</p>
        </div>

        <form onSubmit={soumettre} className="space-y-4 rounded-xl border border-line/70 bg-white p-6">
          {sessionExpiree && !erreur && <Alerte>Votre session a expiré. Reconnectez-vous.</Alerte>}
          <Alerte>{erreur}</Alerte>
          <Champ
            id="email"
            libelle="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            obligatoire
            autoFocus
          />
          <Champ
            id="mot-de-passe"
            libelle="Mot de passe"
            type="password"
            autoComplete="current-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            obligatoire
          />
          <Button type="submit" icone={LogIn} chargement={envoi} className="w-full">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
