import { Loader2 } from "lucide-react";

const VARIANTES = {
  primaire: "bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50",
  secondaire: "bg-white text-heading border border-line hover:bg-gray-50 disabled:text-muted",
  danger: "bg-secondary text-white hover:bg-[#8e1414] disabled:bg-secondary/50",
  fantome: "text-body hover:bg-gray-100 disabled:text-muted",
};

export default function Button({
  variante = "primaire",
  icone: Icone,
  chargement = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${VARIANTES[variante]} ${className}`}
      disabled={chargement || props.disabled}
      {...props}
    >
      {chargement ? <Loader2 className="size-4 animate-spin" /> : Icone && <Icone className="size-4" />}
      {children}
    </button>
  );
}
