import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Plus, Save, Trash2, X } from "lucide-react";
import { evenementsApi } from "../../api";
import { urlFichier } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Page } from "../../components/layout/Mise";
import { Carte } from "../../components/ui/Carte";
import { BadgeStatut } from "../../components/ui/Badge";
import Alerte from "../../components/ui/Alerte";
import Button from "../../components/ui/Button";
import { Champ, ZoneTexte } from "../../components/ui/Champ";
import EditeurTexte from "../../components/ui/EditeurTexte";
import EnvoiFichier from "../../components/ui/EnvoiFichier";
import Interrupteur from "../../components/ui/Interrupteur";
import { Confirmation } from "../../components/ui/Fenetre";
import { EtatVide } from "../../components/ui/Tableau";
import { dateCourte } from "../../utils/format";
import EditeurProgramme from "./EditeurProgramme";

const TYPES = ["Formation", "Conférence", "Atelier", "Séminaire", "Colloque", "Rencontre institutionnelle", "Webinaire"];

const VIDE = {
  sigle: "",
  type: "Formation",
  theme: "",
  titre: "",
  resume: "",
  description: "",
  debut: "",
  fin: "",
  lieu: "",
  infos: [],
  programme: [],
  document_libelle: "",
  publie: false,
};

// Ne garde que les champs modifiables (l'API renvoie aussi id, slug, photos…)
const versFormulaire = (e) => Object.fromEntries(Object.keys(VIDE).map((k) => [k, e[k] ?? VIDE[k]]));

const IMAGE = {
  accepte: "image/jpeg,image/png,image/webp",
  extensions: ["jpg", "jpeg", "png", "webp"],
  tailleMaxMo: 5,
};

function Galerie({ evenement, onMaj, onErreur }) {
  const [envois, setEnvois] = useState(0);
  const [legendes, setLegendes] = useState({});

  const ajouter = async (fichier) => {
    setEnvois((n) => n + 1);
    try {
      onMaj(await evenementsApi.ajouterPhoto(evenement.id, fichier));
    } catch (e) {
      onErreur(e.message);
    } finally {
      setEnvois((n) => n - 1);
    }
  };

  const legender = async (photo) => {
    const legende = legendes[photo.id];
    if (legende === undefined || legende === photo.legende) return;
    try {
      onMaj(await evenementsApi.legenderPhoto(evenement.id, photo.id, legende));
    } catch (e) {
      onErreur(e.message);
    }
  };

  const retirer = async (photo) => {
    try {
      onMaj(await evenementsApi.supprimerPhoto(evenement.id, photo.id));
    } catch (e) {
      onErreur(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <EnvoiFichier
        {...IMAGE}
        multiple
        libelle={envois ? `Envoi en cours (${envois})…` : "Ajouter des photos"}
        aide="Plusieurs fichiers possibles · JPG, PNG ou WEBP · 5 Mo maximum chacun"
        onFichier={ajouter}
      />
      {evenement.photos.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {evenement.photos.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-lg border border-line">
              <div className="relative">
                <img src={urlFichier(p.chemin)} alt="" className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => retirer(p)}
                  className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-secondary shadow hover:bg-white"
                  title="Retirer la photo"
                  aria-label="Retirer la photo"
                >
                  <X className="size-4" />
                </button>
              </div>
              <input
                className="w-full border-0 border-t border-line px-3 py-2 text-xs text-heading placeholder:text-muted/70 focus:outline-none"
                placeholder="Légende (facultatif)"
                maxLength={200}
                value={legendes[p.id] ?? p.legende}
                onChange={(e) => setLegendes((l) => ({ ...l, [p.id]: e.target.value }))}
                onBlur={() => legender(p)}
                aria-label="Légende de la photo"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FormulaireEvenement() {
  const { id } = useParams();
  const creation = !id;
  const navigate = useNavigate();
  const location = useLocation();
  const { estAdmin, peutRediger } = useAuth();
  const lectureSeule = !peutRediger;

  const [evenement, setEvenement] = useState(null); // version enregistrée
  const [form, setForm] = useState(VIDE);
  const [couverture, setCouverture] = useState(null); // fichiers choisis, envoyés à l'enregistrement
  const [documentPdf, setDocumentPdf] = useState(null);
  const [chargement, setChargement] = useState(!creation);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState({ type: "", texte: "" });
  const [confirmer, setConfirmer] = useState(false);

  useEffect(() => {
    if (creation) return;
    evenementsApi
      .lire(id)
      .then((e) => {
        setEvenement(e);
        setForm(versFormulaire(e));
      })
      .catch((e) => setMessage({ type: "erreur", texte: e.message }))
      .finally(() => setChargement(false));
  }, [id, creation]);

  const apercu = useMemo(() => (couverture ? URL.createObjectURL(couverture) : null), [couverture]);
  useEffect(() => () => apercu && URL.revokeObjectURL(apercu), [apercu]);

  const changer = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));
  const majInfo = (i, champ, valeur) =>
    setForm((f) => ({ ...f, infos: f.infos.map((x, k) => (k === i ? { ...x, [champ]: valeur } : x)) }));

  const enregistrer = async (e) => {
    e.preventDefault();
    if (form.fin < form.debut) {
      setMessage({ type: "erreur", texte: "La date de fin doit être après la date de début." });
      return;
    }
    setEnvoi(true);
    setMessage({ type: "", texte: "" });
    try {
      let evt = creation ? await evenementsApi.creer(form) : await evenementsApi.modifier(id, form);
      if (couverture) evt = await evenementsApi.envoyerCouverture(evt.id, couverture);
      if (documentPdf) evt = await evenementsApi.envoyerDocument(evt.id, documentPdf);
      setCouverture(null);
      setDocumentPdf(null);
      if (creation) {
        navigate(`/evenements/${evt.id}`, { replace: true, state: { cree: true } });
        return;
      }
      setEvenement(evt);
      setForm(versFormulaire(evt));
      setMessage({ type: "succes", texte: "Modifications enregistrées." });
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  const retirerDocument = async () => {
    try {
      setEvenement(await evenementsApi.retirerDocument(id));
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    }
  };

  const supprimer = async () => {
    try {
      await evenementsApi.supprimer(id);
      navigate("/evenements", { replace: true });
    } catch (err) {
      setConfirmer(false);
      setMessage({ type: "erreur", texte: err.message });
    }
  };

  if (chargement) {
    return (
      <Page titre="Événement">
        <EtatVide chargement />
      </Page>
    );
  }

  const couvertureAffichee = apercu || urlFichier(evenement?.couverture);

  return (
    <Page
      titre={creation ? "Nouvel événement" : lectureSeule ? evenement?.sigle ?? "Événement" : `Modifier « ${evenement?.sigle ?? ""} »`}
      actions={
        <Link to="/evenements">
          <Button variante="secondaire" icone={ArrowLeft}>
            Retour
          </Button>
        </Link>
      }
    >
      {location.state?.cree && !message.texte && (
        <Alerte type="succes">Événement créé. Vous pouvez maintenant ajouter les photos de la galerie.</Alerte>
      )}
      <Alerte type={message.type}>{message.texte}</Alerte>

      {lectureSeule && <Alerte type="info">Consultation seule : les événements sont gérés par les éditeurs et l'Admin.</Alerte>}

      <form onSubmit={enregistrer} className="grid gap-5 lg:grid-cols-3">
        <fieldset disabled={lectureSeule} className="contents">
        <div className="space-y-5 lg:col-span-2">
          <Carte titre="Fiche de l'événement">
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ id="sigle" libelle="Nom court" aide="Ex. MOPIET 2026 · sert aussi à l'adresse de la page" value={form.sigle} onChange={changer("sigle")} max={80} obligatoire />
              <div className="space-y-1.5">
                <label htmlFor="type" className="text-sm font-medium text-heading">
                  Type <span className="text-secondary">*</span>
                </label>
                <input
                  id="type"
                  list="types-evenement"
                  value={form.type}
                  onChange={changer("type")}
                  maxLength={60}
                  required
                  className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-heading focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <datalist id="types-evenement">
                  {TYPES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                <p className="text-xs text-muted">Choisir dans la liste ou saisir un autre type.</p>
              </div>
              <div className="sm:col-span-2">
                <Champ id="titre" libelle="Intitulé complet" value={form.titre} onChange={changer("titre")} max={300} obligatoire />
              </div>
              <Champ id="theme" libelle="Thème" aide="Facultatif, ex. Intelligence économique territoriale" value={form.theme} onChange={changer("theme")} max={120} />
              <Champ id="lieu" libelle="Lieu" value={form.lieu} onChange={changer("lieu")} max={200} />
              <Champ id="debut" type="date" libelle="Date de début" value={form.debut} onChange={changer("debut")} obligatoire />
              <Champ id="fin" type="date" libelle="Date de fin" value={form.fin} min={form.debut || undefined} onChange={changer("fin")} obligatoire />
              <div className="sm:col-span-2">
                <ZoneTexte
                  id="resume"
                  libelle="Résumé"
                  aide="Une ou deux phrases, affichées dans la liste des événements."
                  value={form.resume}
                  onChange={changer("resume")}
                  max={500}
                  rows={3}
                />
              </div>
            </div>
          </Carte>

          <Carte titre="Présentation" sousTitre="Texte mis en forme affiché sur la page de l'événement">
            <EditeurTexte
              id="description"
              valeur={form.description}
              onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              hauteur="min-h-48"
              modifiable={!lectureSeule}
            />
          </Carte>

          <Carte titre="Informations complémentaires" sousTitre="Ex. Organisateurs, Formateur principal, Public visé">
            <div className="space-y-2">
              {form.infos.map((info, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="w-44 shrink-0 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    placeholder="Libellé"
                    value={info.libelle}
                    maxLength={60}
                    required
                    onChange={(e) => majInfo(i, "libelle", e.target.value)}
                    aria-label="Libellé"
                  />
                  <input
                    className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    placeholder="Valeur"
                    value={info.valeur}
                    maxLength={200}
                    required
                    onChange={(e) => majInfo(i, "valeur", e.target.value)}
                    aria-label="Valeur"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, infos: f.infos.filter((_, k) => k !== i) }))}
                    className="rounded-md p-2 text-muted hover:bg-secondary-bg hover:text-secondary"
                    title="Retirer"
                    aria-label="Retirer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              {form.infos.length < 8 && (
                <Button
                  variante="secondaire"
                  icone={Plus}
                  className="!px-3 !py-1.5"
                  onClick={() => setForm((f) => ({ ...f, infos: [...f.infos, { libelle: "", valeur: "" }] }))}
                >
                  Ajouter une information
                </Button>
              )}
            </div>
          </Carte>

          <Carte titre="Programme" sousTitre="Horaires, activités et intervenants, jour par jour">
            <EditeurProgramme
              programme={form.programme}
              debut={form.debut}
              onChange={(programme) => setForm((f) => ({ ...f, programme }))}
            />
          </Carte>

          <Carte titre="Galerie photos" sousTitre={evenement ? `${evenement.photos.length} photo(s)` : undefined}>
            {evenement ? (
              <Galerie
                evenement={evenement}
                onMaj={setEvenement}
                onErreur={(texte) => setMessage({ type: "erreur", texte })}
              />
            ) : (
              <p className="text-sm text-muted">Enregistrez d'abord l'événement pour ajouter des photos.</p>
            )}
          </Carte>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Carte titre="Publication">
            <div className="space-y-4">
              <Interrupteur
                id="publie"
                libelle="Publier sur le site"
                aide={form.publie ? "Visible par tous les visiteurs." : "Brouillon : visible seulement ici."}
                actif={form.publie}
                onChange={(v) => setForm((f) => ({ ...f, publie: v }))}
              />
              {evenement && (
                <dl className="space-y-2 border-t border-line/70 pt-4 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Statut</dt>
                    <dd>
                      <BadgeStatut publie={evenement.publie} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Publié le</dt>
                    <dd className="text-heading">{dateCourte(evenement.publie_le)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Adresse</dt>
                    <dd className="truncate font-mono text-xs text-heading" title={evenement.slug}>
                      /evenements/{evenement.slug}
                    </dd>
                  </div>
                </dl>
              )}
              {!lectureSeule && (
                <Button type="submit" icone={Save} chargement={envoi} className="w-full">
                  {creation ? "Créer l'événement" : "Enregistrer"}
                </Button>
              )}
              {!creation && estAdmin && (
                <Button variante="fantome" icone={Trash2} className="w-full text-secondary hover:bg-secondary-bg" onClick={() => setConfirmer(true)}>
                  Supprimer
                </Button>
              )}
            </div>
          </Carte>

          <Carte titre="Image de couverture">
            <div className="space-y-3">
              {couvertureAffichee && <img src={couvertureAffichee} alt="" className="aspect-video w-full rounded-lg object-cover" />}
              {couverture && <p className="text-xs text-muted">Nouvelle image : envoyée à l'enregistrement.</p>}
              <EnvoiFichier
                {...IMAGE}
                libelle={couvertureAffichee ? "Remplacer l'image" : "Choisir une image"}
                aide="JPG, PNG ou WEBP · 5 Mo maximum"
                onFichier={setCouverture}
              />
            </div>
          </Carte>

          <Carte titre="Document à télécharger" sousTitre="Facultatif : chronogramme, brochure…">
            <div className="space-y-3">
              <Champ
                id="document_libelle"
                libelle="Texte du bouton"
                placeholder="Télécharger le programme (PDF)"
                value={form.document_libelle}
                onChange={changer("document_libelle")}
                max={120}
              />
              {evenement?.document && !documentPdf && (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <a href={urlFichier(evenement.document)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                    <FileText className="size-4" /> Document en ligne
                  </a>
                  <button type="button" onClick={retirerDocument} className="text-xs text-secondary hover:underline">
                    Retirer
                  </button>
                </div>
              )}
              {documentPdf && <p className="text-xs text-muted">{documentPdf.name} : envoyé à l'enregistrement.</p>}
              <EnvoiFichier
                accepte="application/pdf"
                extensions={["pdf"]}
                tailleMaxMo={20}
                libelle={evenement?.document ? "Remplacer le PDF" : "Choisir un PDF"}
                aide="PDF · 20 Mo maximum"
                onFichier={setDocumentPdf}
              />
            </div>
          </Carte>
        </div>
        </fieldset>
      </form>

      <Confirmation
        ouverte={confirmer}
        titre="Supprimer l'événement"
        message={`« ${evenement?.sigle} », son programme, son document et toutes ses photos seront définitivement supprimés du site.`}
        onConfirmer={supprimer}
        onAnnuler={() => setConfirmer(false)}
      />
    </Page>
  );
}
