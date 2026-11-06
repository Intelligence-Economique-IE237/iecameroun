import PageLegale, { Info } from "../components/PageLegale";
import { conservationJournaux, conservationMessages, editeur, googleAnalytics } from "../data/legal";

const Lien = ({ href, children }) => (
    <a href={href} className="text-primary underline underline-offset-2" {...(href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}>
      {children}
    </a>
);

const Liste = ({ children }) => <ul className="m-0 flex list-disc flex-col gap-2 pl-5 marker:text-primary">{children}</ul>;

const EMAIL = <Lien href={`mailto:${editeur.email}`}>{editeur.email}</Lien>;

const cookies = [
  {
    nom: "ie237-lu-…",
    role: "Stockage de session du navigateur : éviter de compter deux fois la lecture d'un même article",
    duree: "Fermeture de l'onglet",
  },
  { nom: "_ga", role: "Distinguer les visiteurs pour la mesure d'audience (Google Analytics)", duree: "2 ans" },
  { nom: `_ga_${googleAnalytics.identifiant.replace(/^G-/, "")}`, role: "Conserver l'état de la visite (Google Analytics)", duree: "2 ans" },
];

const sections = [
  {
    id: "responsable",
    titre: "Responsable du traitement",
    contenu: (
        <p className="m-0">
          {editeur.nom}, {editeur.siege}, est responsable des traitements de données personnelles réalisés par le site
          iecameroun.cm. Pour toute question : {EMAIL}.
        </p>
    ),
  },
  {
    id: "donnees",
    titre: "Données collectées et finalités",
    contenu: (
        <>
          <p className="m-0">Le site ne propose ni création de compte, ni formulaire en ligne. Seules les données suivantes sont traitées :</p>
          <Liste>
            <li>
              <strong className="text-heading">Mesure d&apos;audience.</strong> Le site utilise Google Analytics pour
              connaître le nombre de visites, les pages consultées, la durée des visites, le type d&apos;appareil et de
              navigateur et le pays ou la ville approximatifs des visiteurs. Ces statistiques servent à améliorer le site.
            </li>
            <li>
              <strong className="text-heading">Compteur de lectures.</strong> Quand vous ouvrez une actualité, le
              compteur de lectures de cet article augmente d&apos;une unité. Aucune information sur vous n&apos;est
              enregistrée avec ce compteur.
            </li>
            <li>
              <strong className="text-heading">Vos messages.</strong> Lorsque vous nous écrivez (contact, demande de
              devis), nous recevons votre adresse électronique, votre nom et les informations que vous choisissez de nous
              transmettre, uniquement pour répondre à votre demande et assurer le suivi de nos échanges.
            </li>
            <li>
              <strong className="text-heading">Journaux techniques.</strong> Le serveur enregistre automatiquement
              l&apos;adresse IP, la date et la page demandée, pour assurer la sécurité et le bon fonctionnement du site.
            </li>
          </Liste>
          <p className="m-0">
            Les boutons de partage vers les réseaux sociaux sont de simples liens : aucun contenu de ces réseaux n&apos;est
            chargé tant que vous ne cliquez pas. Les polices de caractères sont hébergées avec le site.
          </p>
        </>
    ),
  },
  {
    id: "cookies",
    titre: "Cookies",
    contenu: (
        <>
          <p className="m-0">Le site utilise les cookies et éléments de stockage suivants :</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead className="bg-[#F7F8F7] text-heading">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cookie</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="px-4 py-3 font-semibold">Durée</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c) => (
                    <tr key={c.nom} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-[13px] text-heading">{c.nom}</td>
                      <td className="px-4 py-3">{c.role}</td>
                      <td className="whitespace-nowrap px-4 py-3">{c.duree}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="m-0">
            Vous pouvez refuser ou supprimer ces cookies depuis les réglages de votre navigateur, ou installer le{" "}
            <Lien href="https://tools.google.com/dlpage/gaoptout">module de désactivation de Google Analytics</Lien>. La
            consultation du site n&apos;en est pas affectée.
          </p>
        </>
    ),
  },
  {
    id: "destinataires",
    titre: "Destinataires et transferts",
    contenu: (
        <>
          <p className="m-0">
            Vos données sont accessibles aux seuls membres d&apos;IE237 chargés de répondre aux demandes et
            d&apos;administrer le site. Elles ne sont ni vendues, ni louées.
          </p>
          <p className="m-0">
            Les statistiques de visite sont traitées par Google, prestataire de la mesure d&apos;audience, sur des
            serveurs situés hors du Cameroun. Pour en savoir plus :{" "}
            <Lien href="https://policies.google.com/privacy?hl=fr">règles de confidentialité de Google</Lien>.
          </p>
        </>
    ),
  },
  {
    id: "conservation",
    titre: "Durées de conservation",
    contenu: (
        <Liste>
          <li>
            Statistiques de visite (Google Analytics) : <Info valeur={googleAnalytics.conservation} />.
          </li>
          <li>
            Messages reçus : <Info valeur={conservationMessages} />.
          </li>
          <li>
            Journaux techniques du serveur : <Info valeur={conservationJournaux} />.
          </li>
        </Liste>
    ),
  },
  {
    id: "droits",
    titre: "Vos droits",
    contenu: (
        <>
          <p className="m-0">
            Conformément à la loi n° 2024/017 du 23 décembre 2024 relative à la protection des données à caractère
            personnel au Cameroun, vous disposez des droits suivants sur vos données :
          </p>
          <Liste>
            <li>accès : savoir quelles données nous détenons sur vous ;</li>
            <li>rectification : faire corriger des données inexactes ;</li>
            <li>effacement : faire supprimer vos données ;</li>
            <li>opposition : refuser l&apos;utilisation de vos données, notamment pour la mesure d&apos;audience.</li>
          </Liste>
          <p className="m-0">
            Pour exercer ces droits, écrivez à {EMAIL} en précisant votre demande. Si vous estimez que vos droits ne sont
            pas respectés, vous pouvez saisir l&apos;Autorité de protection des données à caractère personnel instituée par
            cette loi.
          </p>
        </>
    ),
  },
  {
    id: "securite",
    titre: "Sécurité",
    contenu: (
        <p className="m-0">
          Les échanges avec le site sont chiffrés (HTTPS). L&apos;espace d&apos;administration est réservé aux membres
          habilités d&apos;IE237 et protégé par mot de passe.
        </p>
    ),
  },
  {
    id: "modifications",
    titre: "Modifications",
    contenu: (
        <p className="m-0">
          Cette politique peut être mise à jour, notamment en cas d&apos;évolution du site ou de la réglementation. La date
          de dernière mise à jour figure en haut de la page.
        </p>
    ),
  },
];

const Confidentialite = () => (
    <PageLegale
        titre="Politique de confidentialité"
        description="Politique de confidentialité du site IE237 : données collectées, cookies, durées de conservation et droits des visiteurs."
        intro={
          <p className="m-0">
            IE237 attache une grande importance à la protection de vos données personnelles. Cette page explique quelles
            données sont collectées lorsque vous consultez le site, pourquoi, et comment exercer vos droits.
          </p>
        }
        sections={sections}
        autre={{ vers: "/mentions-legales", libelle: "Mentions légales" }}
    />
);

export default Confidentialite;
