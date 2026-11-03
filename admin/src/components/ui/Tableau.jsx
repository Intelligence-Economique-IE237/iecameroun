import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Inbox, Loader2 } from "lucide-react";

export const PAR_PAGE = 10;

export function Tableau({ colonnes, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line/70">
            {colonnes.map((c) => (
              <th key={c} className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">{children}</tbody>
      </table>
    </div>
  );
}

export function Cellule({ className = "", children }) {
  return <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>;
}

export function EtatVide({ chargement, message, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center text-sm text-muted">
      {chargement ? <Loader2 className="size-6 animate-spin text-primary" /> : <Inbox className="size-8 text-line" />}
      <p>{chargement ? "Chargement…" : message}</p>
      {!chargement && action}
    </div>
  );
}

// Découpe une liste en pages (l'API renvoie tout ; les volumes restent petits)
export function usePagination(elements) {
  const [page, setPage] = useState(1);
  const nbPages = Math.max(1, Math.ceil(elements.length / PAR_PAGE));
  useEffect(() => {
    if (page > nbPages) setPage(nbPages);
  }, [page, nbPages]);
  return {
    page,
    nbPages,
    setPage,
    visibles: elements.slice((page - 1) * PAR_PAGE, page * PAR_PAGE),
  };
}

export function Pagination({ page, nbPages, setPage }) {
  if (nbPages <= 1) return null;
  const bouton = "inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-sm text-heading hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-muted/60";
  return (
    <div className="flex items-center justify-between border-t border-line/70 px-5 py-3">
      <button className={bouton} disabled={page === 1} onClick={() => setPage(page - 1)}>
        <ArrowLeft className="size-4" /> Précédent
      </button>
      <div className="flex gap-1">
        {Array.from({ length: nbPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`size-9 rounded-lg text-sm ${n === page ? "bg-gray-100 font-medium text-heading" : "text-body hover:bg-gray-50"}`}
          >
            {n}
          </button>
        ))}
      </div>
      <button className={bouton} disabled={page === nbPages} onClick={() => setPage(page + 1)}>
        Suivant <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
