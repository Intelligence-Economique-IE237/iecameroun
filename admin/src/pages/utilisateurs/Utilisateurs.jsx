import { useMemo, useState } from "react";
import { Pencil, Plus, ShieldCheck, Trash2, UserPen, Users } from "lucide-react";
import { utilisateursApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { Page } from "../../components/layout/Mise";
import { Carte, CarteStat } from "../../components/ui/Carte";
import Badge from "../../components/ui/Badge";
import Alerte from "../../components/ui/Alerte";
import Button from "../../components/ui/Button";
import BarreFiltres, { correspond } from "../../components/ui/BarreFiltres";
import { Champ, Selection } from "../../components/ui/Champ";
import { Confirmation, Fenetre } from "../../components/ui/Fenetre";
import { Cellule, EtatVide, Pagination, Tableau, usePagination } from "../../components/ui/Tableau";
import useChargement from "../../utils/useChargement";
import { ROLES, initiales } from "../../utils/format";

const OPTIONS_ROLES = [
  { valeur: "editeur", libelle: "Éditeur : rédige, publie après validation, gère les événements" },
  { valeur: "analyste", libelle: "Analyste : valide les actualités, gère les livrables" },
  { valeur: "admin", libelle: "Admin : tout, y compris suppressions et comptes" },
];

function FenetreCompte({ compte, onFermer, onEnregistre }) {
  const creation = !compte?.id;
  const [form, setForm] = useState({
    email: compte?.email || "",
    nom: compte?.nom || "",
    role: compte?.role || "editeur",
    mot_de_passe: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const changer = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));

  const enregistrer = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");
    try {
      const donnees = creation
        ? form
        : { nom: form.nom, role: form.role, ...(form.mot_de_passe && { mot_de_passe: form.mot_de_passe }) };
      const resultat = creation ? await utilisateursApi.creer(donnees) : await utilisateursApi.modifier(compte.id, donnees);
      onEnregistre(resultat, creation);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Fenetre
      ouverte
      titre={creation ? "Nouveau compte" : `Modifier ${compte.nom || compte.email}`}
      onFermer={onFermer}
      pied={
        <>
          <Button variante="secondaire" onClick={onFermer}>
            Annuler
          </Button>
          <Button type="submit" form="form-compte" chargement={envoi}>
            {creation ? "Créer le compte" : "Enregistrer"}
          </Button>
        </>
      }
    >
      <form id="form-compte" onSubmit={enregistrer} className="space-y-4">
        <Alerte>{erreur}</Alerte>
        <Champ
          id="email"
          libelle="Email"
          type="email"
          value={form.email}
          onChange={changer("email")}
          disabled={!creation}
          aide={creation ? undefined : "L'email ne peut pas être modifié."}
          obligatoire
        />
        <Champ id="nom" libelle="Nom affiché" value={form.nom} onChange={changer("nom")} max={120} />
        <Selection id="role" libelle="Rôle" value={form.role} onChange={changer("role")} options={OPTIONS_ROLES} />
        <Champ
          id="mot_de_passe"
          libelle={creation ? "Mot de passe" : "Nouveau mot de passe"}
          type="password"
          autoComplete="new-password"
          value={form.mot_de_passe}
          onChange={changer("mot_de_passe")}
          minLength={12}
          obligatoire={creation}
          aide={creation ? "12 caractères minimum. Communiquez-le à la personne de façon sûre." : "Laisser vide pour ne pas le changer. 12 caractères minimum."}
        />
      </form>
    </Fenetre>
  );
}

export default function Utilisateurs() {
  const { utilisateur: moi } = useAuth();
  const { donnees, setDonnees, chargement, erreur } = useChargement(() => utilisateursApi.lister());
  const [recherche, setRecherche] = useState("");
  const [enEdition, setEnEdition] = useState(null); // {} = création, compte = modification
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppression, setSuppression] = useState(false);
  const [message, setMessage] = useState({ type: "", texte: "" });

  const filtres = useMemo(
    () => (donnees || []).filter((u) => correspond(`${u.nom} ${u.email}`, recherche)),
    [donnees, recherche],
  );
  const pagination = usePagination(filtres);
  const nbAdmins = donnees?.filter((u) => u.role === "admin").length;

  const enregistre = (compte, creation) => {
    setDonnees((liste) => (creation ? [...liste, compte] : liste.map((u) => (u.id === compte.id ? compte : u))));
    setEnEdition(null);
    setMessage({ type: "succes", texte: creation ? `Compte ${compte.email} créé.` : "Compte mis à jour." });
  };

  const supprimer = async () => {
    setSuppression(true);
    try {
      await utilisateursApi.supprimer(aSupprimer.id);
      setDonnees((liste) => liste.filter((u) => u.id !== aSupprimer.id));
      setMessage({ type: "succes", texte: `Compte ${aSupprimer.email} supprimé.` });
    } catch (e) {
      setMessage({ type: "erreur", texte: e.message });
    } finally {
      setSuppression(false);
      setASupprimer(null);
    }
  };

  return (
    <Page titre="Utilisateurs" actions={<Button icone={Plus} onClick={() => setEnEdition({})}>Nouveau compte</Button>}>
      <Alerte>{erreur}</Alerte>
      <Alerte type={message.type}>{message.texte}</Alerte>

      <div className="grid gap-4 sm:grid-cols-3">
        <CarteStat icone={Users} libelle="Comptes" valeur={donnees?.length ?? "—"} />
        <CarteStat icone={ShieldCheck} libelle="Admins" valeur={nbAdmins ?? "—"} detail="Accès complet" />
        <CarteStat icone={UserPen} libelle="Éditeurs" valeur={donnees ? donnees.length - nbAdmins : "—"} detail="Création et publication du contenu" />
      </div>

      <Carte titre="Comptes du panneau" corpsClassName="p-0">
        <div className="border-b border-line/70 px-5 py-3">
          <BarreFiltres recherche={recherche} setRecherche={setRecherche} placeholder="Rechercher par nom ou email" />
        </div>
        {pagination.visibles.length === 0 ? (
          <EtatVide chargement={chargement} message="Aucun compte ne correspond à la recherche." />
        ) : (
          <Tableau colonnes={["Nom", "Email", "Rôle", ""]}>
            {pagination.visibles.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <Cellule>
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-bg text-xs font-semibold text-primary">
                      {initiales(u.nom, u.email)}
                    </span>
                    <span className="font-medium text-heading">
                      {u.nom || "—"} {u.id === moi.id && <span className="text-xs font-normal text-muted">(vous)</span>}
                    </span>
                  </div>
                </Cellule>
                <Cellule className="text-body">{u.email}</Cellule>
                <Cellule>
                  <Badge ton={{ admin: "rouge", analyste: "bleu" }[u.role] || "vert"}>{ROLES[u.role]}</Badge>
                </Cellule>
                <Cellule>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEnEdition(u)} className="rounded-md p-2 text-muted hover:bg-gray-100 hover:text-heading" title="Modifier">
                      <Pencil className="size-4" />
                    </button>
                    {u.id !== moi.id && (
                      <button onClick={() => setASupprimer(u)} className="rounded-md p-2 text-muted hover:bg-secondary-bg hover:text-secondary" title="Supprimer">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </Cellule>
              </tr>
            ))}
          </Tableau>
        )}
        <Pagination {...pagination} />
      </Carte>

      {enEdition && <FenetreCompte compte={enEdition} onFermer={() => setEnEdition(null)} onEnregistre={enregistre} />}
      <Confirmation
        ouverte={!!aSupprimer}
        titre="Supprimer le compte"
        message={`${aSupprimer?.email} ne pourra plus se connecter au panneau.`}
        chargement={suppression}
        onConfirmer={supprimer}
        onAnnuler={() => setASupprimer(null)}
      />
    </Page>
  );
}
