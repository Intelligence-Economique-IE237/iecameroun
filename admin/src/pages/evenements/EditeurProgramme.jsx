// Programme jour par jour : chaque jour a une date, un titre et des lignes
// (horaire, activité, intervenant, nature). Une ligne « intertitre » découpe la journée.
import { ArrowDown, ArrowUp, CalendarPlus, Heading, Plus, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";

export const NATURES = [
  { valeur: "module", libelle: "Module" },
  { valeur: "exercice", libelle: "Exercice pratique" },
  { valeur: "officiel", libelle: "Officiel / protocole" },
  { valeur: "pause", libelle: "Accueil / pause" },
  { valeur: "synthese", libelle: "Synthèse" },
];

const classe =
  "w-full rounded-md border border-line bg-white px-2.5 py-2 text-sm text-heading placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

const LIGNE_VIDE = { horaire: "", activite: "", intervenant: "", nature: "module" };

// Déplace l'élément i d'un cran (sens = -1 vers le haut, +1 vers le bas)
const deplacer = (liste, i, sens) => {
  const j = i + sens;
  if (j < 0 || j >= liste.length) return liste;
  const copie = [...liste];
  [copie[i], copie[j]] = [copie[j], copie[i]];
  return copie;
};

const lendemain = (date) => {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

function BoutonIcone({ titre, onClick, disabled, danger, children }) {
  return (
    <button
      type="button"
      title={titre}
      aria-label={titre}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors disabled:opacity-30 ${
        danger ? "hover:bg-secondary-bg hover:text-secondary" : "hover:bg-gray-100 hover:text-heading"
      }`}
    >
      {children}
    </button>
  );
}

function Ligne({ ligne, index, nb, onChange, onDeplacer, onSupprimer }) {
  const maj = (champ) => (e) => onChange({ ...ligne, [champ]: e.target.value });
  const actions = (
    <div className="flex shrink-0">
      <BoutonIcone titre="Monter" disabled={index === 0} onClick={() => onDeplacer(-1)}>
        <ArrowUp className="size-4" />
      </BoutonIcone>
      <BoutonIcone titre="Descendre" disabled={index === nb - 1} onClick={() => onDeplacer(1)}>
        <ArrowDown className="size-4" />
      </BoutonIcone>
      <BoutonIcone titre="Supprimer la ligne" danger onClick={onSupprimer}>
        <Trash2 className="size-4" />
      </BoutonIcone>
    </div>
  );

  if (ligne.nature === "intertitre") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-primary-bg/60 px-2 py-1.5">
        <Heading className="size-4 shrink-0 text-primary" />
        <input
          className={`${classe} font-medium`}
          placeholder="Intertitre, ex. Cérémonie d'ouverture"
          value={ligne.activite}
          onChange={maj("activite")}
          maxLength={500}
          aria-label="Intertitre"
          required
        />
        {actions}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-line/70 p-2">
      <div className="grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)]">
        <input className={classe} placeholder="08h30 – 10h00" value={ligne.horaire} onChange={maj("horaire")} maxLength={40} aria-label="Horaire" />
        <input className={classe} placeholder="Activité" value={ligne.activite} onChange={maj("activite")} maxLength={500} aria-label="Activité" required />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input className={`${classe} !w-auto min-w-40 flex-1`} placeholder="Intervenant" value={ligne.intervenant} onChange={maj("intervenant")} maxLength={200} aria-label="Intervenant" />
        <select className={`${classe} !w-44`} value={ligne.nature} onChange={maj("nature")} aria-label="Nature">
          {NATURES.map((n) => (
            <option key={n.valeur} value={n.valeur}>
              {n.libelle}
            </option>
          ))}
        </select>
        {actions}
      </div>
    </div>
  );
}

export default function EditeurProgramme({ programme, onChange, debut }) {
  const majJour = (i, jour) => onChange(programme.map((j, k) => (k === i ? jour : j)));

  const ajouterJour = () => {
    const precedent = programme[programme.length - 1];
    const date = precedent ? lendemain(precedent.date) : debut || "";
    onChange([...programme, { date, titre: "", lignes: [{ ...LIGNE_VIDE }] }]);
  };

  return (
    <div className="space-y-4">
      {programme.length === 0 && (
        <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          Aucun programme. Ajoutez un premier jour pour saisir les horaires et les activités.
        </p>
      )}

      {programme.map((jour, i) => (
        <div key={i} className="rounded-lg border border-line">
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-gray-50/70 px-3 py-2.5">
            <span className="text-sm font-semibold text-primary">Jour {i + 1}</span>
            <input
              type="date"
              className={`${classe} !w-44`}
              value={jour.date || ""}
              onChange={(e) => majJour(i, { ...jour, date: e.target.value || null })}
              aria-label={`Date du jour ${i + 1}`}
            />
            <input
              className={`${classe} !w-auto min-w-48 flex-1`}
              placeholder="Titre de la journée, ex. Session d'ouverture"
              value={jour.titre}
              onChange={(e) => majJour(i, { ...jour, titre: e.target.value })}
              maxLength={200}
              aria-label={`Titre du jour ${i + 1}`}
            />
            <div className="flex">
              <BoutonIcone titre="Monter le jour" disabled={i === 0} onClick={() => onChange(deplacer(programme, i, -1))}>
                <ArrowUp className="size-4" />
              </BoutonIcone>
              <BoutonIcone titre="Descendre le jour" disabled={i === programme.length - 1} onClick={() => onChange(deplacer(programme, i, 1))}>
                <ArrowDown className="size-4" />
              </BoutonIcone>
              <BoutonIcone titre="Supprimer le jour" danger onClick={() => onChange(programme.filter((_, k) => k !== i))}>
                <Trash2 className="size-4" />
              </BoutonIcone>
            </div>
          </div>

          <div className="space-y-2 p-3">
            {jour.lignes.map((ligne, l) => (
              <Ligne
                key={l}
                ligne={ligne}
                index={l}
                nb={jour.lignes.length}
                onChange={(nouvelle) => majJour(i, { ...jour, lignes: jour.lignes.map((x, k) => (k === l ? nouvelle : x)) })}
                onDeplacer={(sens) => majJour(i, { ...jour, lignes: deplacer(jour.lignes, l, sens) })}
                onSupprimer={() => majJour(i, { ...jour, lignes: jour.lignes.filter((_, k) => k !== l) })}
              />
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variante="secondaire"
                icone={Plus}
                className="!px-3 !py-1.5"
                onClick={() => majJour(i, { ...jour, lignes: [...jour.lignes, { ...LIGNE_VIDE }] })}
              >
                Ligne
              </Button>
              <Button
                variante="fantome"
                icone={Heading}
                className="!px-3 !py-1.5"
                onClick={() => majJour(i, { ...jour, lignes: [...jour.lignes, { ...LIGNE_VIDE, nature: "intertitre" }] })}
              >
                Intertitre
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Button variante="secondaire" icone={CalendarPlus} onClick={ajouterJour}>
        Ajouter un jour
      </Button>
    </div>
  );
}
