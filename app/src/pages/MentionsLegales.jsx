import PageLegale, { Ligne } from "../components/PageLegale";
import { editeur, hebergement } from "../data/legal";

const Lien = ({ href, children }) => (
    <a href={href} className="text-primary underline underline-offset-2">
      {children}
    </a>
);

const sections = [
  {
    id: "editeur",
    titre: "Éditeur du site",
    contenu: (
        <>
          <p className="m-0">
            Le site iecameroun.cm est édité par {editeur.nom}, {editeur.presentation.toLowerCase()}.
          </p>
          <dl className="m-0 rounded-lg border border-border px-5">
            <Ligne libelle="Dénomination" valeur={editeur.nom} />
            <Ligne libelle="Forme juridique et immatriculation" valeur={editeur.formeJuridique} />
            <Ligne libelle="Siège" valeur={editeur.siege} />
            <Ligne libelle="Adresse électronique" valeur={<Lien href={`mailto:${editeur.email}`}>{editeur.email}</Lien>} />
            <Ligne libelle="Téléphone" valeur={editeur.telephone} />
            <Ligne libelle="Directeur ou directrice de la publication" valeur={editeur.directeurPublication} />
          </dl>
        </>
    ),
  },
  {
    id: "hebergement",
    titre: "Hébergement",
    contenu: (
        <dl className="m-0 rounded-lg border border-border px-5">
          <Ligne libelle="Site internet" valeur={hebergement.site} />
          <Ligne libelle="Contenus publiés (API, documents)" valeur={hebergement.api} />
        </dl>
    ),
  },
  {
    id: "propriete",
    titre: "Propriété intellectuelle",
    contenu: (
        <>
          <p className="m-0">
            Les textes, analyses, publications, photographies, logos et éléments graphiques du site sont la propriété
            d&apos;IE237 ou de leurs auteurs, et sont protégés par le droit de la propriété intellectuelle.
          </p>
          <p className="m-0">
            Toute reproduction, représentation ou diffusion, totale ou partielle, sans l&apos;autorisation écrite préalable
            d&apos;IE237 est interdite, à l&apos;exception des courtes citations accompagnées de la mention de la source
            (« IE237 : Intelligence Économique 237 ») et d&apos;un lien vers la page d&apos;origine.
          </p>
          <p className="m-0">
            Les logos des partenaires et institutions présentés sur le site restent la propriété de leurs titulaires
            respectifs. Les données économiques affichées proviennent de sources publiques citées sur la page (Fonds
            monétaire international, Banque mondiale).
          </p>
        </>
    ),
  },
  {
    id: "responsabilite",
    titre: "Responsabilité",
    contenu: (
        <>
          <p className="m-0">
            IE237 s&apos;efforce de publier des informations exactes et à jour, sans pouvoir garantir l&apos;absence
            d&apos;erreur ou d&apos;omission. Les analyses publiées n&apos;engagent que leurs auteurs et ne constituent pas un
            conseil personnalisé.
          </p>
          <p className="m-0">
            Le site contient des liens vers des sites tiers (réseaux sociaux, institutions, sources de données). IE237
            n&apos;exerce aucun contrôle sur leur contenu et décline toute responsabilité à leur égard.
          </p>
          <p className="m-0">
            Pour signaler une erreur ou un contenu à retirer, écrivez à{" "}
            <Lien href={`mailto:${editeur.email}`}>{editeur.email}</Lien>.
          </p>
        </>
    ),
  },
  {
    id: "donnees",
    titre: "Données personnelles et cookies",
    contenu: (
        <p className="m-0">
          Les données collectées lors de votre visite, leur usage et vos droits sont décrits dans la{" "}
          <Lien href="/politique-de-confidentialite">politique de confidentialité</Lien>.
        </p>
    ),
  },
  {
    id: "droit",
    titre: "Droit applicable",
    contenu: (
        <p className="m-0">
          Le site et les présentes mentions sont soumis au droit camerounais.
        </p>
    ),
  },
];

const MentionsLegales = () => (
    <PageLegale
        titre="Mentions légales"
        description="Mentions légales du site du Think-Do Tank IE237 : éditeur, hébergement, propriété intellectuelle."
        intro={
          <p className="m-0">
            Informations sur l&apos;éditeur du site iecameroun.cm, son hébergement et les conditions
            d&apos;utilisation de ses contenus.
          </p>
        }
        sections={sections}
        autre={{ vers: "/politique-de-confidentialite", libelle: "Politique de confidentialité" }}
    />
);

export default MentionsLegales;
