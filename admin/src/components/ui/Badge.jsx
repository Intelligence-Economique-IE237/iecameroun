const TONS = {
  vert: "bg-primary-bg text-primary",
  gris: "bg-gray-100 text-gray-600",
  rouge: "bg-secondary-bg text-secondary",
  jaune: "bg-tertiary-bg text-[#b26a00]",
};

export default function Badge({ ton = "gris", point = false, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${TONS[ton]}`}>
      {point && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function BadgeStatut({ publie }) {
  return publie ? (
    <Badge ton="vert" point>
      Publié
    </Badge>
  ) : (
    <Badge ton="gris" point>
      Brouillon
    </Badge>
  );
}
