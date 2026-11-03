// Une fonction par route de l'API, regroupées par rubrique.
import { requete } from "./client";

export const authApi = {
  connexion: (email, motDePasse) =>
    requete("/auth/login", { methode: "POST", formulaire: { username: email, password: motDePasse } }),
  moi: () => requete("/auth/moi"),
};

export const actualitesApi = {
  lister: () => requete("/admin/actualites"),
  lire: (id) => requete(`/admin/actualites/${id}`),
  creer: (donnees) => requete("/admin/actualites", { methode: "POST", json: donnees }),
  modifier: (id, donnees) => requete(`/admin/actualites/${id}`, { methode: "PATCH", json: donnees }),
  supprimer: (id) => requete(`/admin/actualites/${id}`, { methode: "DELETE" }),
  envoyerImage: (id, fichier) => requete(`/admin/actualites/${id}/image`, { methode: "POST", fichier }),
};

export const livrablesApi = {
  lister: () => requete("/admin/livrables"),
  lire: (id) => requete(`/admin/livrables/${id}`),
  creer: (donnees) => requete("/admin/livrables", { methode: "POST", json: donnees }),
  modifier: (id, donnees) => requete(`/admin/livrables/${id}`, { methode: "PATCH", json: donnees }),
  supprimer: (id) => requete(`/admin/livrables/${id}`, { methode: "DELETE" }),
  envoyerPdf: (id, fichier) => requete(`/admin/livrables/${id}/fichier`, { methode: "POST", fichier }),
};

export const utilisateursApi = {
  lister: () => requete("/admin/utilisateurs"),
  creer: (donnees) => requete("/admin/utilisateurs", { methode: "POST", json: donnees }),
  modifier: (id, donnees) => requete(`/admin/utilisateurs/${id}`, { methode: "PATCH", json: donnees }),
  supprimer: (id) => requete(`/admin/utilisateurs/${id}`, { methode: "DELETE" }),
};
