import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Images, Pencil, Plus, Trash2 } from "lucide-react";
import { evenementsApi } from "../../api";
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
import { periode } from "../../utils/format";

export default function ListeEvenements() {
  const { estAdmin, peutRediger } = useAuth();
  const navigate = useNavigate();
  const { donnees, setDonnees, chargement, erreur } = useChargement(() => evenementsApi.lister());
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("tous");
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppression, setSuppression] = useState(false);
  const [message, setMessage] = useState({ type: "", texte: "" });

  const filtres = useMemo(
    () =>
      filtrerParStatut(donnees || [], statut).filter((e) =>
        correspond(`${e.sigle} ${e.titre} ${e.lieu} ${e.type}`, recherche),
      ),
    [donnees, statut, recherche],
  );
  const pagination = usePagination(filtres);

  const supprimer = async () => {
    setSuppression(true);
    try {
      await evenementsApi.supprimer(aSupprimer.id);
      setDonnees((liste) => liste.filter((e) => e.id !== aSupprimer.id));
      setMessage({ type: "succes", texte: `« ${aSupprimer.sigle} » a été supprimé.` });
    } catch (e) {
      setMessage({ type: "erreur", texte: e.message });
    } finally {
      setSuppression(false);
      setASupprimer(null);
    }
  };

  return (
    <Page
      titre="Événements"
      actions={
        peutRediger && (
          <Link to="/evenements/nouveau">
            <Button icone={Plus}>Nouvel événement</Button>
          </Link>
        )
      }
    >
      <Alerte>{erreur}</Alerte>
      <Alerte type={message.type}>{message.texte}</Alerte>

      <Carte titre="Tous les événements" sousTitre={donnees ? `${donnees.length} au total` : undefined} corpsClassName="p-0">
        <div className="border-b border-line/70 px-5 py-3">
          <BarreFiltres
            recherche={recherche}
            setRecherche={setRecherche}
            statut={statut}
            setStatut={setStatut}
            placeholder="Rechercher un événement"
          />
        </div>

        {pagination.visibles.length === 0 ? (
          <EtatVide
            chargement={chargement}
            message={donnees?.length ? "Aucun événement ne correspond à la recherche." : "Aucun événement pour le moment."}
          />
        ) : (
          <Tableau colonnes={["Événement", "Dates", "Lieu", "Programme", "Statut", ""]}>
            {pagination.visibles.map((e) => (
              <tr key={e.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/evenements/${e.id}`)}>
                <Cellule>
                  <div className="flex items-center gap-3">
                    {e.couverture ? (
                      <img src={urlFichier(e.couverture)} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                    ) : (
                      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-gray-100 text-muted">
                        <CalendarDays className="size-4" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="max-w-xs truncate font-medium text-heading">{e.sigle}</p>
                      <p className="max-w-xs truncate text-xs text-muted">
                        {e.type} · {e.titre}
                      </p>
                    </div>
                  </div>
                </Cellule>
                <Cellule className="whitespace-nowrap text-body">{periode(e.debut, e.fin)}</Cellule>
                <Cellule className="text-body">{e.lieu || "—"}</Cellule>
                <Cellule className="whitespace-nowrap text-body">
                  {e.programme.length} jour{e.programme.length > 1 ? "s" : ""}
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted">
                    <Images className="size-3.5" /> {e.photos.length}
                  </span>
                </Cellule>
                <Cellule>
                  <BadgeStatut publie={e.publie} />
                </Cellule>
                <Cellule>
                  <div className="flex justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
                    <Link to={`/evenements/${e.id}`} className="rounded-md p-2 text-muted hover:bg-gray-100 hover:text-heading" title="Modifier">
                      <Pencil className="size-4" />
                    </Link>
                    {estAdmin && (
                      <button onClick={() => setASupprimer(e)} className="rounded-md p-2 text-muted hover:bg-secondary-bg hover:text-secondary" title="Supprimer">
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
        titre="Supprimer l'événement"
        message={`« ${aSupprimer?.sigle} », son programme, son document et toutes ses photos seront définitivement supprimés du site.`}
        chargement={suppression}
        onConfirmer={supprimer}
        onAnnuler={() => setASupprimer(null)}
      />
    </Page>
  );
}
