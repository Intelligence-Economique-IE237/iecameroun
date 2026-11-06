import { useEffect, useRef, useState } from "react";

// Fait défiler un nombre de 0 jusqu'à sa valeur quand l'élément devient visible.
// Renvoie [ref à poser sur l'élément, valeur courante].
export default function useCompteur(cible, duree = 1600) {
  const ref = useRef(null);
  const reduit =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [valeur, setValeur] = useState(reduit ? cible : 0);

  useEffect(() => {
    const element = ref.current;
    if (reduit || !element || !("IntersectionObserver" in window)) {
      setValeur(cible);
      return undefined;
    }
    let image;
    const observer = new IntersectionObserver(([entree]) => {
      if (!entree.isIntersecting) return;
      observer.disconnect();
      const debut = performance.now();
      const pas = (maintenant) => {
        const t = Math.min(1, (maintenant - debut) / duree);
        const adouci = 1 - Math.pow(1 - t, 4); // démarre vite, ralentit à la fin
        setValeur(Math.round(cible * adouci));
        if (t < 1) image = requestAnimationFrame(pas);
      };
      image = requestAnimationFrame(pas);
    }, { threshold: 0.4 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(image);
    };
  }, [cible, duree, reduit]);

  return [ref, valeur];
}
