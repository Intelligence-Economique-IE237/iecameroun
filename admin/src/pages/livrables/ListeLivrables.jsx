import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { livrablesApi } from "../../api";
import { urlFichier } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Page } from "../../components/layout/Mise";
import { Carte } from "../../components/ui/Carte";
import Badge, { BadgeStatut } from "../../components/ui/Badge";
import Alerte from "../../components/ui/Alerte";
import Button from "../../components/ui/Button";
import BarreFiltres, { correspond, filtrerParStatut } from "../../components/ui/BarreFiltres";
import { Confirmation } from "../../components/ui/Fenetre";
import { Cellule, EtatVide, Pagination, Tableau, usePagination } from "../../components/ui/Tableau";
import useChargement from "../../utils/useChargement";
import { dateCourte } from "../../utils/format";

export default function ListeLivrables() {
  const { estAdmin } = useAuth();
  const navigate = useNavigate();
  const { donnees, setDonnees, chargement, erreur } = useChargement(() => livrablesApi.lister());
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("tous");
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppression, setSuppression] = useState(false);
  const [message, setMessage] = useState({ type: "", texte: "" });

  const filtres = useMemo(
    () =>
      filtrerParStatut(donnees || [], statut).filter((l) =>
        correspond(`${l.titre} ${l.description} ${l.etiquette}`, recherche),
      ),
    [donnees, statut, recherche],
  );
  const pagination = usePagination(filtres);

  const supprimer = async () => {
    setSuppression(true);
    try {
      await livrablesApi.supprimer(aSupprimer.id);
      setDonnees((liste) => liste.filter((l) => l.id !== aSupprimer.id));
      setMessage({ type: "succes", texte: `« ${aSupprimer.titre} » a été supprimé.` });
    } catch (e) {
      setMessage({ type: "erreur", texte: e.message });
    } finally {
      setSuppression(false);
      setASupprimer(null);
    }
  };

  return (
    <Page
      titre="Livrables"
      actions={
        <Link to="/livrables/nouveau">
          <Button icone={Plus}>Nouveau livrable</Button>
        </Link>
      }
    >
      <Alerte>{erreur}</Alerte>
      <Alerte type={message.type}>{message.texte}</Alerte>

      <Carte
        titre="Études, notes et fiches"
        sousTitre={donnees ? `${donnees.length} au total · affichés dans la section Livrables du site` : undefined}
        corpsClassName="p-0"
      >
        <div className="border-b border-line/70 px-5 py-3">
          <BarreFiltres
            recherche={recherche}
            setRecherche={setRecherche}
            statut={statut}
            setStatut={setStatut}
            placeholder="Rechercher un livrable"
          />
        </div>

        {pagination.visibles.length === 0 ? (
          <EtatVide
            chargement={chargement}
            message={donnees?.length ? "Aucun livrable ne correspond à la recherche." : "Aucun livrable pour le moment."}
          />
        ) : (
          <Tableau colonnes={["Livrable", "Étiquette", "PDF", "Statut", "Publié le", ""]}>
            {pagination.visibles.map((l) => (
              <tr key={l.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/livrables/${l.id}`)}>
                <Cellule>
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary-bg text-secondary">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="max-w-md truncate font-medium text-heading">{l.titre}</p>
                      <p className="max-w-md truncate text-xs text-muted">{l.description || "Sans description"}</p>
                    </div>
                  </div>
                </Cellule>
                <Cellule>
                  <Badge ton="jaune">{l.etiquette}</Badge>
                </Cellule>
                <Cellule>
                  {l.fichier ? (
                    <a
                      href={urlFichier(l.fichier)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Ouvrir <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <Badge ton="rouge">Manquant</Badge>
                  )}
                </Cellule>
                <Cellule>
                  <BadgeStatut publie={l.publie} />
                </Cellule>
                <Cellule className="whitespace-nowrap text-body">{dateCourte(l.publie_le)}</Cellule>
                <Cellule>
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/livrables/${l.id}`} className="rounded-md p-2 text-muted hover:bg-gray-100 hover:text-heading" title="Modifier">
                      <Pencil className="size-4" />
                    </Link>
                    {estAdmin && (
                      <button onClick={() => setASupprimer(l)} className="rounded-md p-2 text-muted hover:bg-secondary-bg hover:text-secondary" title="Supprimer">
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
        titre="Supprimer le livrable"
        message={`« ${aSupprimer?.titre} » et son PDF seront définitivement supprimés du site.`}
        chargement={suppression}
        onConfirmer={supprimer}
        onAnnuler={() => setASupprimer(null)}
      />
    </Page>
  );
}
