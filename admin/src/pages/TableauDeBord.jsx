import { Link } from "react-router-dom";
import { ClipboardCheck, Eye, FileText, Newspaper, Plus, Users } from "lucide-react";
import { actualitesApi, livrablesApi, utilisateursApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { Page } from "../components/layout/Mise";
import { Carte, CarteStat } from "../components/ui/Carte";
import { BadgeEtape, BadgeStatut } from "../components/ui/Badge";
import Alerte from "../components/ui/Alerte";
import BarresLectures from "../components/ui/BarresLectures";
import Button from "../components/ui/Button";
import { EtatVide } from "../components/ui/Tableau";
import useChargement from "../utils/useChargement";
import { dateCourte, nombre } from "../utils/format";

// Ce qui attend chaque rôle dans le circuit de validation
const A_FAIRE = {
  analyste: { statuts: ["soumis"], titre: "Articles à valider", vide: "Aucun article en attente de validation." },
  editeur: { statuts: ["a_corriger", "valide"], titre: "À reprendre ou à publier", vide: "Rien en attente : aucun article à corriger ni à publier." },
  admin: { statuts: ["soumis", "valide"], titre: "En attente dans le circuit", vide: "Aucun article en attente." },
};

function Liste({ titre, elements, chemin, vide, chargement, badge, lien = "Tout voir", vers }) {
  return (
    <Carte
      titre={titre}
      corpsClassName="p-0"
      action={
        <Link to={vers || chemin} className="text-sm font-medium text-primary hover:underline">
          {lien}
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
                  <p className="text-xs text-muted">
                    {e.auteur ? `${e.auteur} · ` : ""}Modifié le {dateCourte(e.modifie_le)}
                  </p>
                </div>
                {badge(e)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Carte>
  );
}

export default function TableauDeBord() {
  const { utilisateur, estAdmin, peutRediger, peutGererLivrables } = useAuth();
  const role = utilisateur?.role;
  const { donnees, chargement, erreur } = useChargement(
    () =>
      Promise.all([
        actualitesApi.lister(),
        livrablesApi.lister(),
        actualitesApi.statistiques(),
        estAdmin ? utilisateursApi.lister() : Promise.resolve(null),
      ]),
    [estAdmin],
  );
  const [actualites, livrables, stats, comptes] = donnees || [];
  const compter = (liste, test) => (liste ? liste.filter(test).length : "—");
  const aFaire = A_FAIRE[role] || A_FAIRE.admin;
  const enAttente = actualites?.filter((a) => aFaire.statuts.includes(a.statut));

  return (
    <Page
      titre="Tableau de bord"
      actions={
        <>
          {peutGererLivrables && (
            <Link to="/livrables/nouveau" className={peutRediger ? "hidden sm:block" : ""}>
              <Button variante={peutRediger ? "secondaire" : "primaire"} icone={Plus}>
                Livrable
              </Button>
            </Link>
          )}
          {peutRediger && (
            <Link to="/actualites/nouvelle">
              <Button icone={Plus}>Actualité</Button>
            </Link>
          )}
        </>
      }
    >
      <p className="text-sm text-body">
        Bonjour <span className="font-medium text-heading">{utilisateur?.nom || utilisateur?.email}</span>, voici l'état du contenu du site.
      </p>
      <Alerte>{erreur}</Alerte>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CarteStat
          icone={Eye}
          libelle="Lectures d'actualités"
          valeur={stats ? nombre(stats.total) : "—"}
          detail={stats ? `${nombre(stats.sur_7_jours)} ces 7 derniers jours` : ""}
        />
        <CarteStat
          icone={ClipboardCheck}
          libelle="En attente de validation"
          valeur={compter(actualites, (a) => a.statut === "soumis")}
          detail={actualites ? `${compter(actualites, (a) => a.statut === "valide")} validé(s), à publier` : ""}
        />
        <CarteStat
          icone={Newspaper}
          libelle="Actualités publiées"
          valeur={compter(actualites, (a) => a.publie)}
          detail={actualites ? `${compter(actualites, (a) => ["brouillon", "a_corriger"].includes(a.statut))} en rédaction` : ""}
        />
        {estAdmin ? (
          <CarteStat
            icone={Users}
            libelle="Comptes"
            valeur={comptes?.length ?? "—"}
            detail={comptes ? `${compter(comptes, (c) => c.role === "analyste")} analyste(s), ${compter(comptes, (c) => c.role === "editeur")} éditeur(s)` : ""}
          />
        ) : (
          <CarteStat
            icone={FileText}
            libelle="Livrables publiés"
            valeur={compter(livrables, (l) => l.publie)}
            detail={livrables ? `${compter(livrables, (l) => !l.publie)} brouillon(s)` : ""}
          />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Carte titre="Lectures des actualités" sousTitre={stats ? `${nombre(stats.sur_30_jours)} sur les 30 derniers jours` : undefined}>
          {stats ? <BarresLectures parJour={stats.par_jour} hauteur={140} /> : <EtatVide chargement={chargement} message="Statistiques indisponibles." />}
        </Carte>
        <Carte titre="Les plus lues" corpsClassName="p-0">
          {!stats?.plus_lus.length ? (
            <EtatVide chargement={chargement} message="Aucune lecture enregistrée pour le moment." />
          ) : (
            <ol className="divide-y divide-line/70">
              {stats.plus_lus.map((a, i) => (
                <li key={a.id}>
                  <Link to={`/actualites/${a.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                    <span className="w-4 text-sm font-semibold text-muted">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-heading">{a.titre}</span>
                    <span className="text-sm tabular-nums text-body">{nombre(a.lectures)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Carte>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Liste
          titre={aFaire.titre}
          elements={enAttente}
          chemin="/actualites"
          vide={aFaire.vide}
          chargement={chargement}
          badge={(e) => <BadgeEtape statut={e.statut} />}
        />
        <Liste
          titre="Derniers livrables"
          elements={livrables}
          chemin="/livrables"
          vide="Aucun livrable pour le moment."
          chargement={chargement}
          badge={(e) => <BadgeStatut publie={e.publie} />}
        />
      </div>
    </Page>
  );
}
