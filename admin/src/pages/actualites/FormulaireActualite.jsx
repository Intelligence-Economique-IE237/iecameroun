import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, EyeOff, Globe, MessageSquareWarning, Save, Send, Trash2, Undo2 } from "lucide-react";
import { actualitesApi } from "../../api";
import { urlFichier } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Page } from "../../components/layout/Mise";
import { Carte } from "../../components/ui/Carte";
import { BadgeEtape } from "../../components/ui/Badge";
import Alerte from "../../components/ui/Alerte";
import BarresLectures from "../../components/ui/BarresLectures";
import Button from "../../components/ui/Button";
import { Champ, ZoneTexte } from "../../components/ui/Champ";
import EditeurTexte from "../../components/ui/EditeurTexte";
import EnvoiFichier from "../../components/ui/EnvoiFichier";
import { Confirmation, Fenetre } from "../../components/ui/Fenetre";
import { EtatVide } from "../../components/ui/Tableau";
import { dateCourte, nombre } from "../../utils/format";

const VIDE = { titre: "", resume: "", contenu: "" };

// Mêmes règles que l'API : qui peut modifier le texte, à quelle étape
const MODIFIABLE = {
  editeur: ["brouillon", "a_corriger"],
  analyste: ["soumis", "valide", "publie"],
};

// Pourquoi le texte est en lecture seule
const RAISON_LECTURE_SEULE = {
  editeur: {
    soumis: "L'article est chez l'analyste pour validation : vous pourrez le modifier s'il vous le renvoie.",
    valide: "L'article est validé : publiez-le, ou demandez à l'analyste de le renvoyer pour le modifier.",
    publie: "L'article est en ligne. Pour le corriger, demandez à l'analyste (il peut modifier le texte) ou retirez-le du site.",
  },
  analyste: {
    brouillon: "L'article est en cours de rédaction : il sera modifiable quand l'éditeur l'aura soumis.",
    a_corriger: "L'article a été renvoyé à l'auteur pour corrections.",
  },
};

// Actions du circuit, selon le rôle et l'étape
const ACTIONS = [
  { action: "soumettre", libelle: "Soumettre à l'analyste", icone: Send, roles: ["editeur", "admin"], depuis: ["brouillon", "a_corriger"] },
  { action: "valider", libelle: "Valider l'article", icone: CheckCircle2, roles: ["analyste", "admin"], depuis: ["soumis"], commentaire: "facultatif" },
  {
    action: "renvoyer",
    libelle: "Demander des corrections",
    icone: Undo2,
    variante: "secondaire",
    roles: ["analyste", "admin"],
    depuis: ["soumis", "valide"],
    commentaire: "obligatoire",
  },
  { action: "publier", libelle: "Publier sur le site", icone: Globe, roles: ["editeur", "admin"], depuis: ["valide"] },
  {
    action: "publier",
    libelle: "Publier directement",
    icone: Globe,
    variante: "secondaire",
    roles: ["admin"],
    depuis: ["brouillon", "soumis", "a_corriger"],
    aide: "Admin : publication sans attendre la validation.",
  },
  { action: "retirer", libelle: "Retirer du site", icone: EyeOff, variante: "secondaire", roles: ["editeur", "admin"], depuis: ["publie"] },
];

const MESSAGES = {
  soumettre: "Article soumis à l'analyste.",
  valider: "Article validé : l'éditeur peut maintenant le publier.",
  renvoyer: "Article renvoyé à l'auteur avec votre commentaire.",
  publier: "Article publié sur le site.",
  retirer: "Article retiré du site.",
};

function Etape({ fait, actif, titre, detail }) {
  const Icone = fait ? CheckCircle2 : Circle;
  return (
    <li className="flex gap-3">
      <Icone className={`mt-0.5 size-4 shrink-0 ${fait ? "text-primary" : actif ? "text-[#b26a00]" : "text-line"}`} />
      <div className="min-w-0">
        <p className={`text-sm ${fait || actif ? "font-medium text-heading" : "text-muted"}`}>{titre}</p>
        {detail && <p className="text-xs text-muted">{detail}</p>}
      </div>
    </li>
  );
}

function Circuit({ a }) {
  const rang = { brouillon: 0, a_corriger: 0, soumis: 1, valide: 2, publie: 3 }[a.statut];
  return (
    <ol className="space-y-3">
      <Etape fait={rang >= 1} actif={rang === 0} titre="Rédaction" detail={a.auteur && `Par ${a.auteur}`} />
      <Etape
        fait={rang >= 2}
        actif={rang === 1}
        titre="Validation par l'analyste"
        detail={rang >= 2 && a.valide_par ? `Par ${a.valide_par}, le ${dateCourte(a.valide_le)}` : a.soumis_le && rang === 1 ? `Soumis le ${dateCourte(a.soumis_le)}` : ""}
      />
      <Etape fait={rang >= 3} actif={rang === 2} titre="Publication" detail={a.publie_le && `Le ${dateCourte(a.publie_le)}`} />
    </ol>
  );
}

export default function FormulaireActualite() {
  const { id } = useParams();
  const creation = !id;
  const navigate = useNavigate();
  const location = useLocation();
  const { estAdmin, peutRediger, utilisateur } = useAuth();
  const role = utilisateur?.role;

  const [actualite, setActualite] = useState(null); // version enregistrée
  const [form, setForm] = useState(VIDE);
  const [image, setImage] = useState(null); // nouvelle image choisie, pas encore envoyée
  const [lectures, setLectures] = useState(null);
  const [chargement, setChargement] = useState(!creation);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState({ type: "", texte: "" });
  const [confirmer, setConfirmer] = useState(false);
  const [fenetre, setFenetre] = useState(null); // action qui demande un commentaire
  const [commentaire, setCommentaire] = useState("");

  const charger = (a) => {
    setActualite(a);
    setForm({ titre: a.titre, resume: a.resume, contenu: a.contenu });
  };

  // Message « créée » affiché une seule fois, puis retiré de l'historique du navigateur
  useEffect(() => {
    if (!location.state?.cree) return;
    setMessage({ type: "succes", texte: "Actualité créée en brouillon. Soumettez-la à l'analyste quand elle est prête." });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (creation) return;
    setChargement(true); // aussi après la création : la page passe de « nouvelle » à l'article
    actualitesApi
      .lire(id)
      .then(charger)
      .catch((e) => setMessage({ type: "erreur", texte: e.message }))
      .finally(() => setChargement(false));
    actualitesApi.lectures(id).then(setLectures).catch(() => {});
  }, [id, creation]);

  // Aperçu local de l'image choisie
  const apercu = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => apercu && URL.revokeObjectURL(apercu), [apercu]);

  const statut = actualite?.statut ?? "brouillon";
  const modifiable = creation ? peutRediger : role === "admin" || (MODIFIABLE[role] || []).includes(statut);
  const modifie =
    !!image || (actualite && (form.titre !== actualite.titre || form.resume !== actualite.resume || form.contenu !== actualite.contenu));
  const actions = creation ? [] : ACTIONS.filter((a) => a.roles.includes(role) && a.depuis.includes(statut));

  const changer = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));

  // Enregistre le texte et l'image ; renvoie l'article à jour
  const sauvegarder = async () => {
    let a = creation ? await actualitesApi.creer(form) : await actualitesApi.modifier(id, form);
    if (image) a = await actualitesApi.envoyerImage(a.id, image);
    setImage(null);
    return a;
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setMessage({ type: "", texte: "" });
    try {
      const a = await sauvegarder();
      if (creation) {
        navigate(`/actualites/${a.id}`, { replace: true, state: { cree: true } });
        return;
      }
      charger(a);
      setMessage({ type: "succes", texte: "Modifications enregistrées." });
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  const executer = async (def, texte = "") => {
    setEnvoi(true);
    setMessage({ type: "", texte: "" });
    try {
      // Les modifications en cours sont enregistrées avant de changer d'étape
      if (modifiable && modifie) await sauvegarder();
      charger(await actualitesApi.changerStatut(id, def.action, texte));
      setFenetre(null);
      setCommentaire("");
      setMessage({ type: "succes", texte: MESSAGES[def.action] });
      actualitesApi.lectures(id).then(setLectures).catch(() => {});
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  const lancer = (def) => {
    if (def.commentaire) {
      setCommentaire("");
      setFenetre(def);
    } else {
      executer(def);
    }
  };

  const supprimer = async () => {
    try {
      await actualitesApi.supprimer(id);
      navigate("/actualites", { replace: true });
    } catch (err) {
      setConfirmer(false);
      setMessage({ type: "erreur", texte: err.message });
    }
  };

  if (chargement || (!creation && !actualite)) {
    return (
      <Page titre="Actualité">
        <Alerte type={message.type}>{message.texte}</Alerte>
        <EtatVide chargement={chargement} message="Actualité introuvable." />
      </Page>
    );
  }

  if (creation && !peutRediger) {
    return (
      <Page titre="Nouvelle actualité">
        <Alerte type="info">Votre rôle ne permet pas de rédiger des actualités.</Alerte>
      </Page>
    );
  }

  const imageAffichee = apercu || urlFichier(actualite?.image);
  const raison = !modifiable && RAISON_LECTURE_SEULE[role]?.[statut];

  return (
    <Page
      titre={creation ? "Nouvelle actualité" : actualite?.titre || "Actualité"}
      actions={
        <Link to="/actualites">
          <Button variante="secondaire" icone={ArrowLeft}>
            Retour
          </Button>
        </Link>
      }
    >
      <Alerte type={message.type}>{message.texte}</Alerte>

      {actualite?.statut === "a_corriger" && actualite.commentaire && (
        <div className="flex items-start gap-3 rounded-lg border border-secondary/20 bg-secondary-bg px-4 py-3 text-sm">
          <MessageSquareWarning className="mt-0.5 size-4 shrink-0 text-secondary" />
          <div>
            <p className="font-medium text-secondary">Corrections demandées par l'analyste</p>
            <p className="mt-1 whitespace-pre-line text-heading">{actualite.commentaire}</p>
          </div>
        </div>
      )}
      {raison && <Alerte type="info">{raison}</Alerte>}

      <form onSubmit={enregistrer} className="grid gap-5 lg:grid-cols-3">
        <Carte titre="Contenu" className="lg:col-span-2">
          <fieldset disabled={!modifiable} className="space-y-4">
            <Champ id="titre" libelle="Titre" value={form.titre} onChange={changer("titre")} max={200} obligatoire />
            <ZoneTexte
              id="resume"
              libelle="Résumé"
              aide="Affiché dans la liste des actualités du site."
              value={form.resume}
              onChange={changer("resume")}
              max={500}
              rows={3}
            />
            <EditeurTexte
              id="contenu"
              libelle="Texte de l'actualité"
              aide={modifiable ? "Titres, gras, listes, citations et liens sont conservés sur le site." : undefined}
              valeur={form.contenu}
              modifiable={modifiable}
              onChange={(html) => setForm((f) => ({ ...f, contenu: html }))}
            />
          </fieldset>
        </Carte>

        <div className="space-y-5">
          <Carte titre="Validation et publication" action={actualite && <BadgeEtape statut={statut} />}>
            <div className="space-y-4">
              {creation ? (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-muted">
                  Auteur : <span className="font-medium text-heading">{utilisateur?.nom || utilisateur?.email}</span>. L'article
                  sera créé en brouillon, puis soumis à un analyste avant publication.
                </p>
              ) : (
                <Circuit a={actualite} />
              )}

              {actualite?.commentaire && actualite.statut !== "a_corriger" && (
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs">
                  <p className="font-medium text-heading">Commentaire de l'analyste</p>
                  <p className="mt-0.5 whitespace-pre-line text-body">{actualite.commentaire}</p>
                </div>
              )}

              <div className="space-y-2 border-t border-line/70 pt-4">
                {modifiable && (
                  <Button type="submit" variante={actions.length ? "secondaire" : "primaire"} icone={Save} chargement={envoi && !fenetre} className="w-full">
                    {creation ? "Créer le brouillon" : "Enregistrer"}
                  </Button>
                )}
                {actions.map((def) => (
                  <div key={def.libelle}>
                    <Button
                      variante={def.variante || "primaire"}
                      icone={def.icone}
                      disabled={envoi}
                      className="w-full"
                      onClick={() => lancer(def)}
                    >
                      {def.libelle}
                    </Button>
                    {def.aide && <p className="mt-1 text-center text-xs text-muted">{def.aide}</p>}
                  </div>
                ))}
                {modifiable && modifie && actions.length > 0 && (
                  <p className="text-center text-xs text-muted">Les modifications en cours seront enregistrées avant.</p>
                )}
                {!creation && estAdmin && (
                  <Button variante="fantome" icone={Trash2} className="w-full text-secondary hover:bg-secondary-bg" onClick={() => setConfirmer(true)}>
                    Supprimer
                  </Button>
                )}
              </div>

              {actualite && (
                <dl className="space-y-2 border-t border-line/70 pt-4 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Modifiée le</dt>
                    <dd className="text-heading">{dateCourte(actualite.modifie_le)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Adresse</dt>
                    <dd className="truncate font-mono text-xs text-heading" title={actualite.slug}>
                      /actualites/{actualite.slug}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </Carte>

          {actualite?.publie_le && lectures && (
            <Carte titre="Lectures sur le site" sousTitre="30 derniers jours">
              <div className="space-y-4">
                <dl className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Au total", lectures.total],
                    ["7 jours", lectures.sur_7_jours],
                    ["30 jours", lectures.sur_30_jours],
                  ].map(([libelle, valeur]) => (
                    <div key={libelle} className="rounded-lg bg-gray-50 px-2 py-2.5">
                      <dd className="text-lg font-semibold text-heading">{nombre(valeur)}</dd>
                      <dt className="text-xs text-muted">{libelle}</dt>
                    </div>
                  ))}
                </dl>
                <BarresLectures parJour={lectures.par_jour} hauteur={80} />
              </div>
            </Carte>
          )}

          <Carte titre="Image de couverture">
            <div className="space-y-3">
              {imageAffichee && <img src={imageAffichee} alt="" className="aspect-video w-full rounded-lg object-cover" />}
              {image && <p className="text-xs text-muted">Nouvelle image : envoyée à l'enregistrement.</p>}
              {modifiable ? (
                <EnvoiFichier
                  accepte="image/jpeg,image/png,image/webp"
                  extensions={["jpg", "jpeg", "png", "webp"]}
                  tailleMaxMo={5}
                  libelle={imageAffichee ? "Remplacer l'image" : "Choisir une image"}
                  aide="JPG, PNG ou WEBP · 5 Mo maximum"
                  onFichier={setImage}
                />
              ) : (
                !imageAffichee && <p className="text-sm text-muted">Pas d'image.</p>
              )}
            </div>
          </Carte>
        </div>
      </form>

      <Fenetre
        ouverte={!!fenetre}
        titre={fenetre?.libelle}
        onFermer={() => setFenetre(null)}
        pied={
          <>
            <Button variante="secondaire" onClick={() => setFenetre(null)}>
              Annuler
            </Button>
            <Button
              icone={fenetre?.icone}
              chargement={envoi}
              disabled={fenetre?.commentaire === "obligatoire" && commentaire.trim().length < 3}
              onClick={() => executer(fenetre, commentaire)}
            >
              {fenetre?.action === "renvoyer" ? "Renvoyer à l'auteur" : "Valider"}
            </Button>
          </>
        }
      >
        <ZoneTexte
          id="commentaire"
          libelle={fenetre?.action === "renvoyer" ? "Ce qu'il faut corriger" : "Commentaire (facultatif)"}
          aide={
            fenetre?.action === "renvoyer"
              ? "L'auteur verra ce message en ouvrant l'article."
              : "Visible par l'auteur et les éditeurs, jamais sur le site."
          }
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          max={2000}
          rows={5}
          autoFocus
        />
      </Fenetre>

      <Confirmation
        ouverte={confirmer}
        titre="Supprimer l'actualité"
        message={`« ${actualite?.titre} » et son image seront définitivement supprimées du site.`}
        onConfirmer={supprimer}
        onAnnuler={() => setConfirmer(false)}
      />
    </Page>
  );
}
