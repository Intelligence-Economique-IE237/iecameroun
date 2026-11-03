import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, Save, Trash2 } from "lucide-react";
import { livrablesApi } from "../../api";
import { urlFichier } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Page } from "../../components/layout/Mise";
import { Carte } from "../../components/ui/Carte";
import { BadgeStatut } from "../../components/ui/Badge";
import Alerte from "../../components/ui/Alerte";
import Button from "../../components/ui/Button";
import { Champ, ZoneTexte } from "../../components/ui/Champ";
import EnvoiFichier from "../../components/ui/EnvoiFichier";
import Interrupteur from "../../components/ui/Interrupteur";
import { Confirmation } from "../../components/ui/Fenetre";
import { EtatVide } from "../../components/ui/Tableau";
import { dateCourte } from "../../utils/format";

const VIDE = { titre: "", description: "", etiquette: "Étude", publie: false };
const ETIQUETTES = ["Étude", "Note de veille", "Fiche d'analyse", "Policy Brief", "Rapport"];

const taille = (octets) => `${(octets / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;

export default function FormulaireLivrable() {
  const { id } = useParams();
  const creation = !id;
  const navigate = useNavigate();
  const location = useLocation();
  const { estAdmin } = useAuth();

  const [livrable, setLivrable] = useState(null);
  const [form, setForm] = useState(VIDE);
  const [pdf, setPdf] = useState(null); // nouveau PDF choisi, pas encore envoyé
  const [chargement, setChargement] = useState(!creation);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState({ type: "", texte: "" });
  const [confirmer, setConfirmer] = useState(false);

  useEffect(() => {
    if (creation) return;
    livrablesApi
      .lire(id)
      .then((l) => {
        setLivrable(l);
        setForm({ titre: l.titre, description: l.description, etiquette: l.etiquette, publie: l.publie });
      })
      .catch((e) => setMessage({ type: "erreur", texte: e.message }))
      .finally(() => setChargement(false));
  }, [id, creation]);

  const aUnPdf = Boolean(pdf || livrable?.fichier);
  const changer = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));

  // L'API refuse de publier sans PDF : on enregistre les textes, puis le PDF, puis la publication
  const enregistrer = async (e) => {
    e.preventDefault();
    if (form.publie && !aUnPdf) {
      setMessage({ type: "erreur", texte: "Ajoutez le PDF avant de publier le livrable." });
      return;
    }
    setEnvoi(true);
    setMessage({ type: "", texte: "" });
    const { publie, ...textes } = form;
    try {
      let l = creation ? await livrablesApi.creer(textes) : await livrablesApi.modifier(id, textes);
      if (pdf) l = await livrablesApi.envoyerPdf(l.id, pdf);
      if (publie !== l.publie) l = await livrablesApi.modifier(l.id, { publie });
      setPdf(null);
      if (creation) {
        navigate(`/livrables/${l.id}`, { replace: true, state: { cree: true } });
        return;
      }
      setLivrable(l);
      setMessage({ type: "succes", texte: "Modifications enregistrées." });
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async () => {
    try {
      await livrablesApi.supprimer(id);
      navigate("/livrables", { replace: true });
    } catch (err) {
      setConfirmer(false);
      setMessage({ type: "erreur", texte: err.message });
    }
  };

  if (chargement) {
    return (
      <Page titre="Livrable">
        <EtatVide chargement />
      </Page>
    );
  }

  return (
    <Page
      titre={creation ? "Nouveau livrable" : "Modifier le livrable"}
      actions={
        <Link to="/livrables">
          <Button variante="secondaire" icone={ArrowLeft}>
            Retour
          </Button>
        </Link>
      }
    >
      {location.state?.cree && !message.texte && <Alerte type="succes">Livrable créé.</Alerte>}
      <Alerte type={message.type}>{message.texte}</Alerte>

      <form onSubmit={enregistrer} className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Carte titre="Informations">
            <div className="space-y-4">
              <Champ id="titre" libelle="Titre" value={form.titre} onChange={changer("titre")} max={200} obligatoire />
              <ZoneTexte
                id="description"
                libelle="Description"
                aide="Texte court affiché sur la carte du livrable."
                value={form.description}
                onChange={changer("description")}
                max={500}
                rows={3}
              />
              <Champ
                id="etiquette"
                libelle="Étiquette"
                aide="Badge affiché sur la carte. Choisissez dans la liste ou saisissez une autre valeur."
                value={form.etiquette}
                onChange={changer("etiquette")}
                max={50}
                list="etiquettes"
                obligatoire
              />
              <datalist id="etiquettes">
                {ETIQUETTES.map((e) => (
                  <option key={e} value={e} />
                ))}
              </datalist>
            </div>
          </Carte>

          <Carte titre="Document PDF" sousTitre="Obligatoire pour publier le livrable.">
            <div className="space-y-3">
              {(pdf || livrable?.fichier) && (
                <div className="flex items-center gap-3 rounded-lg border border-line/70 px-3.5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary-bg text-secondary">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-heading">{pdf ? pdf.name : "PDF en ligne"}</p>
                    <p className="text-xs text-muted">{pdf ? `${taille(pdf.size)} · envoyé à l'enregistrement` : "Fichier actuellement publié"}</p>
                  </div>
                  {!pdf && (
                    <a
                      href={urlFichier(livrable.fichier)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Ouvrir <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              )}
              <EnvoiFichier
                accepte="application/pdf"
                extensions={["pdf"]}
                tailleMaxMo={20}
                libelle={aUnPdf ? "Remplacer le PDF" : "Choisir le PDF"}
                aide="PDF uniquement · 20 Mo maximum"
                onFichier={setPdf}
              />
            </div>
          </Carte>
        </div>

        <Carte titre="Publication" className="self-start">
          <div className="space-y-4">
            <Interrupteur
              id="publie"
              libelle="Publier sur le site"
              aide={
                !aUnPdf
                  ? "Ajoutez d'abord le PDF."
                  : form.publie
                    ? "Visible dans la section Livrables."
                    : "Brouillon : visible seulement ici."
              }
              actif={form.publie}
              disabled={!aUnPdf && !form.publie}
              onChange={(v) => setForm((f) => ({ ...f, publie: v }))}
            />
            {livrable && (
              <dl className="space-y-2 border-t border-line/70 pt-4 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Statut</dt>
                  <dd>
                    <BadgeStatut publie={livrable.publie} />
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Publié le</dt>
                  <dd className="text-heading">{dateCourte(livrable.publie_le)}</dd>
                </div>
              </dl>
            )}
            <Button type="submit" icone={Save} chargement={envoi} className="w-full">
              {creation ? "Créer le livrable" : "Enregistrer"}
            </Button>
            {!creation && estAdmin && (
              <Button variante="fantome" icone={Trash2} className="w-full text-secondary hover:bg-secondary-bg" onClick={() => setConfirmer(true)}>
                Supprimer
              </Button>
            )}
          </div>
        </Carte>
      </form>

      <Confirmation
        ouverte={confirmer}
        titre="Supprimer le livrable"
        message={`« ${livrable?.titre} » et son PDF seront définitivement supprimés du site.`}
        onConfirmer={supprimer}
        onAnnuler={() => setConfirmer(false)}
      />
    </Page>
  );
}
