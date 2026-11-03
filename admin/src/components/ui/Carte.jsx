export function Carte({ titre, sousTitre, action, className = "", corpsClassName = "p-5", children }) {
  return (
    <section className={`rounded-xl border border-line/70 bg-white ${className}`}>
      {(titre || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-line/70 px-5 py-4">
          <div>
            {titre && <h2 className="text-base font-semibold text-heading">{titre}</h2>}
            {sousTitre && <p className="mt-0.5 text-sm text-muted">{sousTitre}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={corpsClassName}>{children}</div>
    </section>
  );
}

// Carte de statistique : icône + libellé, grand nombre, ligne de détail
export function CarteStat({ icone: Icone, libelle, valeur, detail }) {
  return (
    <div className="rounded-xl border border-line/70 bg-white p-4">
      <div className="flex items-center gap-2.5 text-sm text-body">
        <span className="grid size-8 place-items-center rounded-lg border border-line text-primary">
          <Icone className="size-4" />
        </span>
        {libelle}
      </div>
      <p className="mt-3 text-2xl font-semibold text-heading">{valeur}</p>
      {detail && <p className="mt-1.5 text-xs text-muted">{detail}</p>}
    </div>
  );
}
