import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Alerte({ type = "erreur", children }) {
  if (!children) return null;
  const succes = type === "succes";
  const Icone = succes ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={succes ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-lg px-3.5 py-3 text-sm ${
        succes ? "bg-primary-bg text-primary" : "bg-secondary-bg text-secondary"
      }`}
    >
      <Icone className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
