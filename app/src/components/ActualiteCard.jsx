import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { dateLongue, urlFichier } from "../api";

// Carte d'une actualité (liste, accueil). Même style que les cartes d'événements.
const ActualiteCard = ({ actualite }) => {
  const image = urlFichier(actualite.image);

  return (
      <Link
          to={`/actualites/${actualite.slug}`}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface no-underline shadow-sm transition-all duration-300 hover:border-primary hover:shadow-lg"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-primary-bg">
          {image ? (
              <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
          ) : (
              <div className="flex h-full w-full items-center justify-center">
                <img src="/logo-ie237.svg" alt="" className="h-20 w-20 opacity-80" />
              </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <CalendarDays className="h-4 w-4 shrink-0" />
            {dateLongue(actualite.publie_le)}
          </span>
          <h3 className="m-0 text-xl font-bold leading-snug tracking-[-0.02em] text-heading">{actualite.titre}</h3>
          {actualite.resume && <p className="m-0 text-sm leading-relaxed text-body line-clamp-3">{actualite.resume}</p>}

          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary">
            Lire l&apos;actualité
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
  );
};

ActualiteCard.propTypes = {
  actualite: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    titre: PropTypes.string.isRequired,
    resume: PropTypes.string,
    image: PropTypes.string,
    publie_le: PropTypes.string,
  }).isRequired,
};

export default ActualiteCard;
