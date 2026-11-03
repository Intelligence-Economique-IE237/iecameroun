import { Link } from "react-router-dom";
import { Page } from "../components/layout/Mise";

export default function PageIntrouvable() {
  return (
    <Page titre="Page introuvable">
      <div className="rounded-xl border border-line/70 bg-white p-10 text-center">
        <p className="text-sm text-body">Cette page n'existe pas.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    </Page>
  );
}
