import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { actualitesApi } from "../../api";
import { urlFichier } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Page } from "../../components/layout/Mise";
import { Carte } from "../../components/ui/Carte";
import { BadgeStatut } from "../../components/ui/Badge";
import Alerte from "../../components/ui/Alerte";
import Button from "../../components/ui/Button";
import BarreFiltres, { correspond, filtrerParStatut } from "../../components/ui/BarreFiltres";
import { Confirmation } from "../../components/ui/Fenetre";
import { Cellule, EtatVide, Pagination, Tableau, usePagination } from "../../components/ui/Tableau";
import useChargement from "../../utils/useChargement";
import { dateCourte } from "../../utils/format";

export default function ListeActualites() {
  const { estAdmin } = useAuth();
  const navigate = useNavigate();
  const { donnees, setDonnees, chargement, erreur } = useChargement(() => actualitesApi.lister());
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("tous");
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppression, setSuppression] = useState(false);
  const [message, setMessage] = useState({ type: "", texte: "" });

  const filtrees = useMemo(
    () => filtrerParStatut(donnees || [], statut).filter((a) => correspond(`${a.titre} ${a.resume}`, recherche)),
    [donnees, statut, recherche],
  );
  const pagination = usePagination(filtrees);

  const supprimer = async () => {
    setSuppression(true);
    try {
      await actualitesApi.supprimer(aSupprimer.id);
      setDonnees((liste) => liste.filter((a) => a.id !== aSupprimer.id));
      setMessage({ type: "succes", texte: `« ${aSupprimer.titre} » a été supprimée.` });
    } catch (e) {
      setMessage({ type: "erreur", texte: e.message });
    } finally {
      setSuppression(false);
      setASupprimer(null);
    }
  };

  return (
    <Page
      titre="Actualités"
      actions={
        <Link to="/actualites/nouvelle">
          <Button icone={Plus}>Nouvelle actualité</Button>
        </Link>
      }
    >
      <Alerte>{erreur}</Alerte>
      <Alerte type={message.type}>{message.texte}</Alerte>

      <Carte
        titre="Toutes les actualités"
        sousTitre={donnees ? `${donnees.length} au total` : undefined}
        corpsClassName="p-0"
      >
        <div className="border-b border-line/70 px-5 py-3">
          <BarreFiltres
            recherche={recherche}
            setRecherche={setRecherche}
            statut={statut}
            setStatut={setStatut}
            placeholder="Rechercher une actualité"
          />
        </div>

        {pagination.visibles.length === 0 ? (
          <EtatVide
            chargement={chargement}
            message={donnees?.length ? "Aucune actualité ne correspond à la recherche." : "Aucune actualité pour le moment."}
          />
        ) : (
          <Tableau colonnes={["Actualité", "Statut", "Publiée le", "Modifiée le", ""]}>
            {pagination.visibles.map((a) => (
              <tr key={a.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/actualites/${a.id}`)}>
                <Cellule>
                  <div className="flex items-center gap-3">
                    {a.image ? (
                      <img src={urlFichier(a.image)} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                    ) : (
                      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-gray-100 text-muted">
                        <ImageOff className="size-4" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="max-w-md truncate font-medium text-heading">{a.titre}</p>
                      <p className="max-w-md truncate text-xs text-muted">{a.resume || "Sans résumé"}</p>
                    </div>
                  </div>
                </Cellule>
                <Cellule>
                  <BadgeStatut publie={a.publie} />
                </Cellule>
                <Cellule className="whitespace-nowrap text-body">{dateCourte(a.publie_le)}</Cellule>
                <Cellule className="whitespace-nowrap text-body">{dateCourte(a.modifie_le)}</Cellule>
                <Cellule>
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/actualites/${a.id}`} className="rounded-md p-2 text-muted hover:bg-gray-100 hover:text-heading" title="Modifier">
                      <Pencil className="size-4" />
                    </Link>
                    {estAdmin && (
                      <button onClick={() => setASupprimer(a)} className="rounded-md p-2 text-muted hover:bg-secondary-bg hover:text-secondary" title="Supprimer">
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

      <Confirmation
        ouverte={!!aSupprimer}
        titre="Supprimer l'actualité"
        message={`« ${aSupprimer?.titre} » et son image seront définitivement supprimées du site.`}
        chargement={suppression}
        onConfirmer={supprimer}
        onAnnuler={() => setASupprimer(null)}
      />
    </Page>
  );
}
