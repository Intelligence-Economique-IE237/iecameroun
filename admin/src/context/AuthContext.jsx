import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api";
import { jeton, quandSessionExpire } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [sessionExpiree, setSessionExpiree] = useState(false);

  const deconnecter = useCallback(() => {
    jeton.effacer();
    setUtilisateur(null);
  }, []);

  // Au démarrage : si un jeton est enregistré, on recharge le compte
  useEffect(() => {
    quandSessionExpire(() => {
      setSessionExpiree(true);
      deconnecter();
    });
    if (!jeton.lire()) {
      setChargement(false);
      return;
    }
    authApi
      .moi()
      .then(setUtilisateur)
      .catch(deconnecter)
      .finally(() => setChargement(false));
  }, [deconnecter]);

  const connecter = useCallback(async (email, motDePasse) => {
    const { access_token } = await authApi.connexion(email, motDePasse);
    jeton.ecrire(access_token);
    const moi = await authApi.moi();
    setSessionExpiree(false);
    setUtilisateur(moi);
  }, []);

  const valeur = useMemo(
    () => ({
      utilisateur,
      chargement,
      sessionExpiree,
      estAdmin: utilisateur?.role === "admin",
      connecter,
      deconnecter,
    }),
    [utilisateur, chargement, sessionExpiree, connecter, deconnecter],
  );

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
