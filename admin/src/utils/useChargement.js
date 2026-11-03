import { useCallback, useEffect, useState } from "react";

// Charge des données au montage, avec état de chargement, erreur et rechargement
export default function useChargement(charger, dependances = []) {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur("");
    try {
      setDonnees(await charger());
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }, dependances);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { donnees, setDonnees, chargement, erreur, recharger };
}
