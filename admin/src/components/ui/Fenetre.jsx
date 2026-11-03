import { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

// Fenêtre modale simple (Échap ou clic à l'extérieur pour fermer)
export function Fenetre({ ouverte, titre, onFermer, children, pied }) {
  useEffect(() => {
    if (!ouverte) return;
    const touche = (e) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [ouverte, onFermer]);

  if (!ouverte) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onFermer} />
      <div role="dialog" aria-modal="true" aria-label={titre} className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-heading">{titre}</h2>
          <button onClick={onFermer} className="rounded-md p-1 text-muted hover:bg-gray-100" aria-label="Fermer">
            <X className="size-4" />
          </button>
        </header>
        <div className="px-5 py-4">{children}</div>
        {pied && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">{pied}</footer>}
      </div>
    </div>
  );
}

// Confirmation avant une action irréversible (suppression)
export function Confirmation({ ouverte, titre, message, libelleAction = "Supprimer", chargement, onConfirmer, onAnnuler }) {
  return (
    <Fenetre
      ouverte={ouverte}
      titre={titre}
      onFermer={onAnnuler}
      pied={
        <>
          <Button variante="secondaire" onClick={onAnnuler}>
            Annuler
          </Button>
          <Button variante="danger" chargement={chargement} onClick={onConfirmer}>
            {libelleAction}
          </Button>
        </>
      }
    >
      <p className="text-sm text-body">{message}</p>
    </Fenetre>
  );
}
