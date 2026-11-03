// Interrupteur on/off (ex. Publier)
export default function Interrupteur({ id, actif, onChange, libelle, aide, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-heading">
          {libelle}
        </label>
        {aide && <p className="mt-0.5 text-xs text-muted">{aide}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={actif}
        disabled={disabled}
        onClick={() => onChange(!actif)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          actif ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${actif ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
