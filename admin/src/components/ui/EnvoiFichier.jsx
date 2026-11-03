import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

// Zone de dépôt : clic ou glisser-déposer. Vérifie type et taille avant l'envoi.
export default function EnvoiFichier({ accepte, extensions, tailleMaxMo, libelle, aide, onFichier, disabled }) {
  const champ = useRef(null);
  const [survol, setSurvol] = useState(false);
  const [erreur, setErreur] = useState("");

  const choisir = (fichier) => {
    if (!fichier) return;
    const ext = fichier.name.split(".").pop().toLowerCase();
    if (!extensions.includes(ext)) {
      setErreur(`Format non accepté. Formats possibles : ${extensions.join(", ").toUpperCase()}`);
      return;
    }
    if (fichier.size > tailleMaxMo * 1024 * 1024) {
      setErreur(`Fichier trop lourd (${tailleMaxMo} Mo maximum)`);
      return;
    }
    setErreur("");
    onFichier(fichier);
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => champ.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          if (!disabled) choisir(e.dataTransfer.files[0]);
        }}
        className={`flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          survol ? "border-primary bg-primary-bg" : "border-line bg-gray-50/60 hover:border-primary/60"
        }`}
      >
        <UploadCloud className="size-6 text-primary" />
        <span className="text-sm font-medium text-heading">{libelle}</span>
        <span className="text-xs text-muted">{aide}</span>
      </button>
      <input
        ref={champ}
        type="file"
        accept={accepte}
        className="hidden"
        onChange={(e) => {
          choisir(e.target.files[0]);
          e.target.value = "";
        }}
      />
      {erreur && <p className="text-xs text-secondary">{erreur}</p>}
    </div>
  );
}
