import { Link } from "react-router-dom";
import { FileText, Newspaper, PenLine, Plus, Users } from "lucide-react";
import { actualitesApi, livrablesApi, utilisateursApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { Page } from "../components/layout/Mise";
import { Carte, CarteStat } from "../components/ui/Carte";
import { BadgeStatut } from "../components/ui/Badge";
import Alerte from "../components/ui/Alerte";
import Button from "../components/ui/Button";
import { EtatVide } from "../components/ui/Tableau";
import useChargement from "../utils/useChargement";
import { dateCourte } from "../utils/format";

function Derniers({ titre, elements, chemin, vide, chargement }) {
  return (
    <Carte
      titre={titre}
      corpsClassName="p-0"
      action={
        <Link to={chemin} className="text-sm font-medium text-primary hover:underline">
          Tout voir
        </Link>
      }
    >
      {!elements?.length ? (
        <EtatVide chargement={chargement} message={vide} />
      ) : (
        <ul className="divide-y divide-line/70">
          {elements.slice(0, 5).map((e) => (
            <li key={e.id}>
              <Link to={`${chemin}/${e.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-gray-50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-heading">{e.titre}</p>
                  <p className="text-xs text-muted">Modifié le {dateCourte(e.modifie_le)}</p>
                </div>
                <BadgeStatut publie={e.publie} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Carte>
  );
}

export default function TableauDeBord() {
  const { utilisateur, estAdmin } = useAuth();
  const { donnees, chargement, erreur } = useChargement(
    () =>
      Promise.all([
        actualitesApi.lister(),
        livrablesApi.lister(),
        estAdmin ? utilisateursApi.lister() : Promise.resolve(null),
      ]),
    [estAdmin],
  );
  const [actualites, livrables, comptes] = donnees || [];
  const publies = (liste) => liste?.filter((e) => e.publie).length ?? "—";
  const brouillons = (liste) => liste?.filter((e) => !e.publie).length ?? 0;

  return (
    <Page
      titre="Tableau de bord"
      actions={
        <>
          <Link to="/livrables/nouveau" className="hidden sm:block">
            <Button variante="secondaire" icone={Plus}>
              Livrable
            </Button>
          </Link>
          <Link to="/actualites/nouvelle">
            <Button icone={Plus}>Actualité</Button>
          </Link>
        </>
      }
    >
      <p className="text-sm text-body">
        Bonjour <span className="font-medium text-heading">{utilisateur?.nom || utilisateur?.email}</span>, voici l'état du contenu du site.
      </p>
      <Alerte>{erreur}</Alerte>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CarteStat icone={Newspaper} libelle="Actualités publiées" valeur={publies(actualites)} detail={`${brouillons(actualites)} brouillon(s)`} />
        <CarteStat icone={FileText} libelle="Livrables publiés" valeur={publies(livrables)} detail={`${brouillons(livrables)} brouillon(s)`} />
        <CarteStat
          icone={PenLine}
          libelle="Brouillons à finaliser"
          valeur={donnees ? brouillons(actualites) + brouillons(livrables) : "—"}
          detail="Actualités et livrables non publiés"
        />
        {estAdmin ? (
          <CarteStat
            icone={Users}
            libelle="Comptes"
            valeur={comptes?.length ?? "—"}
            detail={comptes ? `${comptes.filter((c) => c.role === "admin").length} admin(s)` : ""}
          />
        ) : (
          <CarteStat icone={Users} libelle="Votre rôle" valeur="Éditeur" detail="Création et publication" />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Derniers titre="Dernières actualités" elements={actualites} chemin="/actualites" vide="Aucune actualité pour le moment." chargement={chargement} />
        <Derniers titre="Derniers livrables" elements={livrables} chemin="/livrables" vide="Aucun livrable pour le moment." chargement={chargement} />
      </div>
    </Page>
  );
}
