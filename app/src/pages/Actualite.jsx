import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Link2 } from "lucide-react";
import Header from "../components/Header";
import Footer, { reseaux } from "../components/Footer";
import ChargementLogo from "../components/ChargementLogo";
import ContenuRiche from "../components/ContenuRiche";
import ActualiteCard from "../components/ActualiteCard";
import RevealOnScroll from "../components/RevealOnScroll";
import { Conteneur, TraitAccent } from "../components/ui";
import { Introuvable, compterLecture, dateLongue, getActualite, getActualites, urlFichier, useApi } from "../api";

const Retour = () => (
    <Link to="/actualites" className="inline-flex items-center gap-2 text-[14px] font-medium text-muted no-underline hover:text-primary">
      <ArrowLeft className="h-4 w-4" />
      Toutes les actualités
    </Link>
);

// Auteur affiché : le compte qui a publié l'article, sinon le Think-Do Tank
const nomAuteur = (actualite) => actualite.auteur || "IE237";

const initiales = (nom) =>
    nom
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((m) => m[0].toUpperCase())
        .join("");

const tempsLecture = (html) => {
  const mots = (html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(mots / 220));
};

// ---------- Partage ----------

const liensPartage = (url, titre) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(titre);
  return {
    LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    X: `https://x.com/intent/post?url=${u}&text=${t}`,
    Facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    WhatsApp: `https://wa.me/?text=${t}%20${u}`,
  };
};

const CLASSE_ROND =
    "grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-heading no-underline transition-colors hover:border-primary hover:bg-primary hover:text-white";

// Barre de partage : verticale et flottante à gauche du texte sur grand écran, en ligne sur mobile
const Partage = ({ titre, vertical = false }) => {
  const [copie, setCopie] = useState(false);
  const url = window.location.href;
  const liens = liensPartage(url, titre);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      window.prompt("Copiez le lien de l'article :", url);
    }
  };

  return (
      <div className={`flex items-center gap-2 ${vertical ? "flex-col" : "flex-wrap"}`} aria-label="Partager l'article">
        <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] text-muted ${vertical ? "mb-1" : "mr-1"}`}>
          Partager
        </span>
        {reseaux
            .filter((r) => liens[r.nom])
            .map((r) => (
                <a
                    key={r.nom}
                    href={liens[r.nom]}
                    target="_blank"
                    rel="noreferrer"
                    className={CLASSE_ROND}
                    aria-label={`Partager sur ${r.nom}`}
                    title={`Partager sur ${r.nom}`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d={r.d} />
                  </svg>
                </a>
            ))}
        <button
            type="button"
            onClick={copier}
            className={`${CLASSE_ROND} cursor-pointer ${copie ? "!border-primary !bg-primary !text-white" : ""}`}
            aria-label={copie ? "Lien copié" : "Copier le lien"}
            title={copie ? "Lien copié" : "Copier le lien"}
        >
          {copie ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        </button>
        <span role="status" className="sr-only">
          {copie ? "Lien copié" : ""}
        </span>
      </div>
  );
};

Partage.propTypes = { titre: PropTypes.string.isRequired, vertical: PropTypes.bool };

// ---------- À lire aussi ----------

const ALire = ({ slug }) => {
  const { donnees } = useApi(getActualites, "a-lire");
  const autres = (donnees || []).filter((a) => a.slug !== slug).slice(0, 3);
  if (!autres.length) return null;

  return (
      <section className="border-t border-border py-16 sm:py-20">
        <Conteneur>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <TraitAccent />
              <h2 className="m-0 text-[28px] font-bold leading-tight tracking-[-0.02em] text-heading sm:text-[34px]">À lire aussi</h2>
            </div>
            <Retour />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {autres.map((a, i) => (
                <RevealOnScroll key={a.id} delay={i * 100} className="h-full">
                  <ActualiteCard actualite={a} />
                </RevealOnScroll>
            ))}
          </div>
        </Conteneur>
      </section>
  );
};

ALire.propTypes = { slug: PropTypes.string.isRequired };

// ---------- Page ----------

const Actualite = () => {
  const { slug } = useParams();
  const { donnees: actualite, chargement, erreur } = useApi(() => getActualite(slug), slug);

  useEffect(() => {
    if (!actualite) return;
    document.title = `${actualite.titre} | IE237`;
    const meta = document.querySelector('head > meta[name="description"]');
    if (meta && actualite.resume) meta.content = actualite.resume;
    compterLecture(actualite.slug);
  }, [actualite]);

  const image = urlFichier(actualite?.image);

  return (
      <div className="w-full min-h-screen overflow-x-hidden bg-background">
        <Header hero={false} />

        <main className="w-full text-body">
          {chargement && (
              <div className="flex justify-center py-32">
                <ChargementLogo libelle="Chargement de l'actualité" />
              </div>
          )}

          {!chargement && erreur && (
              <Conteneur className="py-20">
                <div className="flex max-w-2xl flex-col gap-4">
                  <h1 className="m-0 text-3xl font-bold text-heading">
                    {erreur instanceof Introuvable ? "Actualité introuvable" : "Actualité indisponible"}
                  </h1>
                  <p className="m-0 text-base text-body">
                    {erreur instanceof Introuvable
                        ? "Cette actualité n'existe pas ou n'est plus publiée."
                        : "Elle ne peut pas être chargée pour le moment. Réessayez dans quelques instants."}
                  </p>
                  <Retour />
                </div>
              </Conteneur>
          )}

          {actualite && (
              <>
                <article>
                  {/* En-tête de l'article */}
                  <Conteneur className="pb-10 pt-10 sm:pt-14">
                    <Retour />
                    <div className="mt-8 max-w-[820px]">
                      <p className="m-0 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary">
                        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-tertiary" />
                        Actualité
                      </p>
                      <h1 className="m-0 mt-4 text-[32px] font-bold leading-[1.12] tracking-[-0.025em] text-heading sm:text-[46px]">
                        {actualite.titre}
                      </h1>
                      {actualite.resume && (
                          <p className="m-0 mt-5 text-[18px] leading-[1.6] text-body sm:text-[20px]">{actualite.resume}</p>
                      )}

                      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-[14px] font-semibold text-white">
                          {initiales(nomAuteur(actualite))}
                        </span>
                        <div className="text-[14px] leading-snug">
                          <p className="m-0 font-semibold text-heading">Par {nomAuteur(actualite)}</p>
                          <p className="m-0 text-muted">
                            <time dateTime={actualite.publie_le}>{dateLongue(actualite.publie_le)}</time>
                            {" · "}
                            {tempsLecture(actualite.contenu)} min de lecture
                          </p>
                        </div>
                      </div>
                    </div>
                  </Conteneur>

                  {image && (
                      <Conteneur>
                        {/* Image entière, sans recadrage : les visuels (affiches, infographies) contiennent du texte */}
                        <img src={image} alt="" className="mx-auto h-auto w-full max-w-[960px] rounded-lg border border-border" />
                      </Conteneur>
                  )}

                  {/* Texte, avec la barre de partage flottante à gauche */}
                  <Conteneur className="py-10 sm:py-14">
                    <div className="grid gap-8 lg:grid-cols-[56px_minmax(0,700px)] lg:gap-14">
                      <aside className="hidden lg:block">
                        <div className="sticky top-28">
                          <Partage titre={actualite.titre} vertical />
                        </div>
                      </aside>

                      <div className="min-w-0">
                        <div className="mb-8 border-b border-border pb-6 lg:hidden">
                          <Partage titre={actualite.titre} />
                        </div>
                        <ContenuRiche html={actualite.contenu} className="text-[17px] leading-[1.8]" />
                      </div>
                    </div>
                  </Conteneur>
                </article>

                <ALire slug={slug} />
              </>
          )}
        </main>

        <Footer />
      </div>
  );
};

export default Actualite;
