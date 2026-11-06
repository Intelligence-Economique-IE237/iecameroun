import { useEffect, useRef, useState } from "react";

// Progression de 0 à 1 déclenchée une fois, quand l'élément devient visible.
// Sert à tracer les courbes et à faire monter les chiffres en même temps.
// Renvoie [ref à poser sur l'élément, progression entre 0 et 1].
export default function useProgression(duree = 1600, delai = 0) {
  const ref = useRef(null);
  const reduit =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [p, setP] = useState(reduit ? 1 : 0);

  useEffect(() => {
    const element = ref.current;
    if (reduit || !element || !("IntersectionObserver" in window)) {
      setP(1);
      return undefined;
    }
    let image;
    let minuterie;
    const observer = new IntersectionObserver(
        ([entree]) => {
          if (!entree.isIntersecting) return;
          observer.disconnect();
          minuterie = setTimeout(() => {
            const debut = performance.now();
            const pas = (maintenant) => {
              const t = Math.min(1, Math.max(0, (maintenant - debut) / duree));
              setP(1 - Math.pow(1 - t, 3)); // démarre vite, ralentit à la fin
              if (t < 1) image = requestAnimationFrame(pas);
            };
            image = requestAnimationFrame(pas);
          }, delai);
        },
        { threshold: 0.35 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(minuterie);
      cancelAnimationFrame(image);
    };
  }, [duree, delai, reduit]);

  return [ref, p];
}
