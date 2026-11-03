import { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { Menu } from "lucide-react";
import BarreLaterale from "./BarreLaterale";

// Structure commune : barre latérale fixe + contenu de la page
export default function Mise() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  return (
    <div className="min-h-screen">
      <BarreLaterale ouverte={menuOuvert} onFermer={() => setMenuOuvert(false)} />
      <div className="lg:pl-64">
        <Outlet context={{ ouvrirMenu: () => setMenuOuvert(true) }} />
      </div>
    </div>
  );
}

// À utiliser dans chaque page : en-tête (titre + actions) puis contenu
export function Page({ titre, actions, children }) {
  const { ouvrirMenu } = useOutletContext();
  return (
    <>
      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-line/70 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <button onClick={ouvrirMenu} className="rounded-md p-1.5 text-body hover:bg-gray-100 lg:hidden" aria-label="Ouvrir le menu">
            <Menu className="size-5" />
          </button>
          <h1 className="text-lg font-semibold text-heading">{titre}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <main className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">{children}</main>
    </>
  );
}
