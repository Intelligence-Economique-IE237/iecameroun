import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { actualitesApi } from "../../api";
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

const VIDE = { titre: "", resume: "", contenu: "", publie: false };

export default function FormulaireActualite() {
  const { id } = useParams();
  const creation = !id;
  const navigate = useNavigate();
  const location = useLocation();
  const { estAdmin } = useAuth();

  const [actualite, setActualite] = useState(null); // version enregistrée
  const [form, setForm] = useState(VIDE);
  const [image, setImage] = useState(null); // nouvelle image choisie, pas encore envoyée
  const [chargement, setChargement] = useState(!creation);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState({ type: "", texte: "" });
  const [confirmer, setConfirmer] = useState(false);

  useEffect(() => {
    if (creation) return;
    actualitesApi
      .lire(id)
      .then((a) => {
        setActualite(a);
        setForm({ titre: a.titre, resume: a.resume, contenu: a.contenu, publie: a.publie });
      })
      .catch((e) => setMessage({ type: "erreur", texte: e.message }))
      .finally(() => setChargement(false));
  }, [id, creation]);

  // Aperçu local de l'image choisie
  const apercu = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => apercu && URL.revokeObjectURL(apercu), [apercu]);

  const changer = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));

  const enregistrer = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setMessage({ type: "", texte: "" });
    try {
      let a = creation ? await actualitesApi.creer(form) : await actualitesApi.modifier(id, form);
      if (image) a = await actualitesApi.envoyerImage(a.id, image);
      setImage(null);
      if (creation) {
        navigate(`/actualites/${a.id}`, { replace: true, state: { cree: true } });
        return;
      }
      setActualite(a);
      setMessage({ type: "succes", texte: "Modifications enregistrées." });
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    } finally {
      setEnvoi(false);
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

  if (chargement) {
    return (
      <Page titre="Actualité">
        <EtatVide chargement />
      </Page>
    );
  }

  const imageAffichee = apercu || urlFichier(actualite?.image);

  return (
    <Page
      titre={creation ? "Nouvelle actualité" : "Modifier l'actualité"}
      actions={
        <Link to="/actualites">
          <Button variante="secondaire" icone={ArrowLeft}>
            Retour
          </Button>
        </Link>
      }
    >
      {location.state?.cree && !message.texte && <Alerte type="succes">Actualité créée.</Alerte>}
      <Alerte type={message.type}>{message.texte}</Alerte>

      <form onSubmit={enregistrer} className="grid gap-5 lg:grid-cols-3">
        <Carte titre="Contenu" className="lg:col-span-2">
          <div className="space-y-4">
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
            <ZoneTexte id="contenu" libelle="Texte de l'actualité" value={form.contenu} onChange={changer("contenu")} rows={14} />
          </div>
        </Carte>

        <div className="space-y-5">
          <Carte titre="Publication">
            <div className="space-y-4">
              <Interrupteur
                id="publie"
                libelle="Publier sur le site"
                aide={form.publie ? "Visible par tous les visiteurs." : "Brouillon : visible seulement ici."}
                actif={form.publie}
                onChange={(v) => setForm((f) => ({ ...f, publie: v }))}
              />
              {actualite && (
                <dl className="space-y-2 border-t border-line/70 pt-4 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Statut</dt>
                    <dd>
                      <BadgeStatut publie={actualite.publie} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Publiée le</dt>
                    <dd className="text-heading">{dateCourte(actualite.publie_le)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Adresse</dt>
                    <dd className="truncate font-mono text-xs text-heading" title={actualite.slug}>
                      /{actualite.slug}
                    </dd>
                  </div>
                </dl>
              )}
              <Button type="submit" icone={Save} chargement={envoi} className="w-full">
                {creation ? "Créer l'actualité" : "Enregistrer"}
              </Button>
              {!creation && estAdmin && (
                <Button variante="fantome" icone={Trash2} className="w-full text-secondary hover:bg-secondary-bg" onClick={() => setConfirmer(true)}>
                  Supprimer
                </Button>
              )}
            </div>
          </Carte>

          <Carte titre="Image de couverture">
            <div className="space-y-3">
              {imageAffichee && <img src={imageAffichee} alt="" className="aspect-video w-full rounded-lg object-cover" />}
              {image && <p className="text-xs text-muted">Nouvelle image : envoyée à l'enregistrement.</p>}
              <EnvoiFichier
                accepte="image/jpeg,image/png,image/webp"
                extensions={["jpg", "jpeg", "png", "webp"]}
                tailleMaxMo={5}
                libelle={imageAffichee ? "Remplacer l'image" : "Choisir une image"}
                aide="JPG, PNG ou WEBP · 5 Mo maximum"
                onFichier={setImage}
              />
            </div>
          </Carte>
        </div>
      </form>

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

