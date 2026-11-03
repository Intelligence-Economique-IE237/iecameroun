// Champs de formulaire avec libellé, aide et compteur de caractères
const classeChamp =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-heading placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-50";

function Cadre({ id, libelle, aide, max, valeur, obligatoire, children }) {
  return (
    <div className="space-y-1.5">
      {libelle && (
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={id} className="text-sm font-medium text-heading">
            {libelle} {obligatoire && <span className="text-secondary">*</span>}
          </label>
          {max && (
            <span className={`text-xs ${(valeur?.length || 0) > max ? "text-secondary" : "text-muted"}`}>
              {valeur?.length || 0}/{max}
            </span>
          )}
        </div>
      )}
      {children}
      {aide && <p className="text-xs text-muted">{aide}</p>}
    </div>
  );
}

export function Champ({ id, libelle, aide, max, obligatoire, ...props }) {
  return (
    <Cadre id={id} libelle={libelle} aide={aide} max={max} valeur={props.value} obligatoire={obligatoire}>
      <input id={id} className={classeChamp} maxLength={max} required={obligatoire} {...props} />
    </Cadre>
  );
}

export function ZoneTexte({ id, libelle, aide, max, obligatoire, rows = 4, ...props }) {
  return (
    <Cadre id={id} libelle={libelle} aide={aide} max={max} valeur={props.value} obligatoire={obligatoire}>
      <textarea id={id} rows={rows} className={`${classeChamp} resize-y`} maxLength={max} required={obligatoire} {...props} />
    </Cadre>
  );
}

export function Selection({ id, libelle, aide, options, ...props }) {
  return (
    <Cadre id={id} libelle={libelle} aide={aide}>
      <select id={id} className={classeChamp} {...props}>
        {options.map((o) => (
          <option key={o.valeur} value={o.valeur}>
            {o.libelle}
          </option>
        ))}
      </select>
    </Cadre>
  );
}
