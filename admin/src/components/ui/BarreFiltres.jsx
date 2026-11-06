import { Search } from "lucide-react";

export const FILTRES_STATUT = [
  { valeur: "tous", libelle: "Tous" },
  { valeur: "publie", libelle: "Publiés" },
  { valeur: "brouillon", libelle: "Brouillons" },
];

export const filtrerParStatut = (elements, statut) =>
  elements.filter((e) => statut === "tous" || (statut === "publie" ? e.publie : !e.publie));

// Recherche + filtre de statut, au-dessus des tableaux.
// « filtres » remplace la liste par défaut : [{ valeur, libelle, nombre }]
export default function BarreFiltres({ recherche, setRecherche, statut, setStatut, placeholder, filtres = FILTRES_STATUT }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-line bg-white py-2 pr-3 pl-9 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </label>
      {setStatut && (
        <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-line bg-gray-50 p-0.5">
          {filtres.map((f) => (
            <button
              key={f.valeur}
              onClick={() => setStatut(f.valeur)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${statut === f.valeur ? "bg-white font-medium text-heading shadow-sm" : "text-body hover:text-heading"}`}
            >
              {f.libelle}
              {f.nombre > 0 && (
                <span className={`rounded-full px-1.5 text-xs ${statut === f.valeur ? "bg-primary-bg text-primary" : "bg-gray-200/70 text-body"}`}>
                  {f.nombre}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Recherche insensible aux accents et à la casse
export const correspond = (texte, recherche) => {
  const normaliser = (s) =>
    (s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  return normaliser(texte).includes(normaliser(recherche.trim()));
};
