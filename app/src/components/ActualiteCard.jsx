import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { dateLongue, urlFichier } from "../api";

// Carte d'une actualité (accueil, page Actualités, « À lire aussi »)
const ActualiteCard = ({ actualite }) => {
  const image = urlFichier(actualite.image);

  return (
      <Link
          to={`/actualites/${actualite.slug}`}
          className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white no-underline transition duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.25)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F1F4F1]">
          {image ? (
              <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
          ) : (
              <div className="flex h-full w-full items-center justify-center">
                <img src="/logo-ie237.svg" alt="" className="h-16 w-16 opacity-50 grayscale" />
              </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A5A]">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {dateLongue(actualite.publie_le)}
            {actualite.auteur && <span className="truncate">· Par {actualite.auteur}</span>}
          </span>
          <h3 className="m-0 text-[17px] font-bold leading-snug text-heading transition-colors group-hover:text-primary">
            {actualite.titre}
          </h3>
          {actualite.resume && <p className="m-0 line-clamp-3 text-[14px] leading-[1.65] text-[#5A5A5A]">{actualite.resume}</p>}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-semibold text-primary">
            Lire la suite
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
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
    auteur: PropTypes.string,
  }).isRequired,
};

export default ActualiteCard;
