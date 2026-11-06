import { NavLink } from "react-router-dom";
import { CalendarDays, FileText, LayoutGrid, LogOut, Newspaper, PanelLeftClose, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROLES, initiales } from "../../utils/format";

const MENU = [
  { vers: "/", libelle: "Tableau de bord", icone: LayoutGrid, fin: true },
  { vers: "/actualites", libelle: "Actualités", icone: Newspaper },
  { vers: "/evenements", libelle: "Événements", icone: CalendarDays },
  { vers: "/livrables", libelle: "Livrables", icone: FileText },
  { vers: "/utilisateurs", libelle: "Utilisateurs", icone: Users, adminSeulement: true },
];

function Lien({ vers, libelle, icone: Icone, fin, onClick }) {
  return (
    <NavLink
      to={vers}
      end={fin}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          isActive ? "bg-primary-bg font-medium text-primary" : "text-body hover:bg-gray-50 hover:text-heading"
        }`
      }
    >
      <Icone className="size-[18px]" />
      {libelle}
    </NavLink>
  );
}

export default function BarreLaterale({ ouverte, onFermer }) {
  const { utilisateur, estAdmin, deconnecter } = useAuth();

  return (
    <>
      {/* Voile sur mobile quand le menu est ouvert */}
      {ouverte && <div className="fixed inset-0 z-30 bg-gray-900/30 lg:hidden" onClick={onFermer} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line/70 bg-white transition-transform lg:translate-x-0 ${
          ouverte ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo-ie237.svg" alt="" className="size-9" />
            <div className="leading-tight">
              <p className="text-base font-semibold text-heading">IE237</p>
              <p className="text-xs text-muted">Administration</p>
            </div>
          </div>
          <button onClick={onFermer} className="rounded-md p-1.5 text-muted hover:bg-gray-100 lg:hidden" aria-label="Fermer le menu">
            <PanelLeftClose className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted">Menu</p>
          {MENU.filter((m) => !m.adminSeulement || estAdmin).map((m) => (
            <Lien key={m.vers} {...m} onClick={onFermer} />
          ))}
        </nav>

        <div className="border-t border-line/70 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
              {initiales(utilisateur?.nom, utilisateur?.email)}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-heading">{utilisateur?.nom || utilisateur?.email}</p>
              <p className="truncate text-xs text-muted">
                {ROLES[utilisateur?.role]} · {utilisateur?.email}
              </p>
            </div>
            <button onClick={deconnecter} className="rounded-md p-1.5 text-muted hover:bg-gray-100 hover:text-secondary" aria-label="Se déconnecter" title="Se déconnecter">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
