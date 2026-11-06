import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const TYPES = {
  erreur: { icone: AlertCircle, classe: "bg-secondary-bg text-secondary", role: "alert" },
  succes: { icone: CheckCircle2, classe: "bg-primary-bg text-primary", role: "status" },
  info: { icone: Info, classe: "bg-blue-50 text-blue-800", role: "status" },
  attention: { icone: AlertCircle, classe: "bg-tertiary-bg text-[#8a5300]", role: "status" },
};

export default function Alerte({ type = "erreur", children }) {
  if (!children) return null;
  const { icone: Icone, classe, role } = TYPES[type] || TYPES.erreur;
  return (
    <div role={role} className={`flex items-start gap-2 rounded-lg px-3.5 py-3 text-sm ${classe}`}>
      <Icone className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
