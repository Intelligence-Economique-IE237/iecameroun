import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Images, Loader2, X, ChevronLeft, ChevronRight, Camera, Download } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";

const INITIAL_COUNT = 6;

// Nom proposé au téléchargement : nom d'origine du fichier, sinon tiré de l'URL
const nomFichier = (photo) => photo.fichier ?? photo.src.split("/").pop();

const DownloadLink = ({ photo, className }) => (
    <a
        href={photo.src}
        download={nomFichier(photo)}
        onClick={(e) => e.stopPropagation()}
        className={`flex h-10 w-10 items-center justify-center rounded-full no-underline transition-colors ${className}`}
        aria-label={`Télécharger la photo${photo.legende ? ` : ${photo.legende}` : ""}`}
        title="Télécharger"
    >
      <Download className="h-[18px] w-[18px]" />
    </a>
);

DownloadLink.propTypes = {
  photo: PropTypes.shape({ src: PropTypes.string.isRequired, fichier: PropTypes.string, legende: PropTypes.string }).isRequired,
  className: PropTypes.string,
};

const Thumbnail = ({ photo, onOpen }) => {
  const [loaded, setLoaded] = useState(false);

  return (
      <div className="group relative">
      <button
          type="button"
          onClick={onOpen}
          className={`relative block w-full cursor-zoom-in overflow-hidden rounded-3xl border-none bg-surface p-0 shadow-sm ${
              loaded ? "" : "min-h-[240px]"
          }`}
          aria-label={`Agrandir la photo${photo.legende ? ` : ${photo.legende}` : ""}`}
      >
        {!loaded && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
            </span>
        )}
        <img
            src={photo.src}
            alt={photo.legende ?? ""}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`block h-auto w-full transition-all duration-500 group-hover:scale-[1.03] ${
                loaded ? "opacity-100" : "opacity-0"
            }`}
        />
        {photo.legende && (
            <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/80 via-black/25 to-transparent px-5 pt-12 pb-4 text-left">
              <span className="h-[2px] w-7 rounded-full bg-tertiary" />
              <span className="text-[13px] sm:text-sm leading-snug tracking-wide text-white/95">
                {photo.legende}
              </span>
            </span>
        )}
      </button>
      {/* Toujours visible sur mobile, au survol sur ordinateur */}
      <DownloadLink
          photo={photo}
          className="absolute right-3 top-3 bg-white/90 text-primary shadow-sm hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      />
      </div>
  );
};

Thumbnail.propTypes = {
  photo: PropTypes.shape({ src: PropTypes.string.isRequired, fichier: PropTypes.string, legende: PropTypes.string }).isRequired,
  onOpen: PropTypes.func.isRequired,
};

const Lightbox = ({ photos, index, onClose, onChange }) => {
  const photo = photos[index];
  const prev = useCallback(() => onChange((index - 1 + photos.length) % photos.length), [index, photos.length, onChange]);
  const next = useCallback(() => onChange((index + 1) % photos.length), [index, photos.length, onChange]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, prev, next]);

  const navBtn =
      "absolute top-1/2 -translate-y-1/2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white transition-colors hover:bg-white/25";

  return (
      <div
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse de photos"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10"
          onClick={onClose}
      >
        <a
            href={photo.src}
            download={nomFichier(photo)}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-[4.25rem] top-4 flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-medium text-white no-underline transition-colors hover:bg-white/25 font-[Poppins]"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Télécharger</span>
        </a>

        <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white transition-colors hover:bg-white/25"
            aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        <figure className="m-0 flex max-h-full max-w-5xl flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <img src={photo.src} alt={photo.legende ?? ""} className="max-h-[78vh] max-w-full rounded-2xl object-contain" />
          <figcaption className="text-center text-sm text-white/85 font-[Poppins]">
            {photo.legende && <span>{photo.legende} · </span>}
            {index + 1} / {photos.length}
          </figcaption>
        </figure>

        {photos.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} className={`${navBtn} left-3 sm:left-6`} aria-label="Photo précédente">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} className={`${navBtn} right-3 sm:right-6`} aria-label="Photo suivante">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
        )}
      </div>
  );
};

Lightbox.propTypes = {
  photos: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

// Nombre de colonnes selon la largeur d'écran (mêmes paliers que Tailwind sm / lg)
const useColumnCount = () => {
  const get = () => {
    if (typeof window === "undefined") return 1;
    if (window.matchMedia("(min-width: 1024px)").matches) return 3;
    if (window.matchMedia("(min-width: 640px)").matches) return 2;
    return 1;
  };
  const [count, setCount] = useState(get);

  useEffect(() => {
    const queries = ["(min-width: 640px)", "(min-width: 1024px)"].map((q) => window.matchMedia(q));
    const update = () => setCount(get());
    queries.forEach((mq) => mq.addEventListener("change", update));
    return () => queries.forEach((mq) => mq.removeEventListener("change", update));
  }, []);

  return count;
};

const EventGallery = ({
  photos,
  emptyMessage = "Les photos de l'événement seront publiées prochainement.",
}) => {
  const [showAll, setShowAll] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const close = useCallback(() => setOpenIndex(null), []);
  const nbColonnes = useColumnCount();

  if (photos.length === 0) {
    return (
        <RevealOnScroll>
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary-soft bg-primary-bg px-6 py-14 text-center">
            <Camera className="h-8 w-8 text-primary" />
            <p className="m-0 max-w-md text-base text-body">{emptyMessage}</p>
          </div>
        </RevealOnScroll>
    );
  }

  const visible = showAll ? photos : photos.slice(0, INITIAL_COUNT);

  return (
      <>
        {/* Mosaïque : photos entières, sans recadrage. Répartition en
            colonnes de gauche à droite pour garder l'ordre chronologique. */}
        <div className="flex items-start gap-4">
          {Array.from({ length: nbColonnes }, (_, col) => (
              <div key={col} className="flex min-w-0 flex-1 flex-col gap-4">
                {visible.map((photo, i) =>
                    i % nbColonnes === col ? (
                        <RevealOnScroll key={photo.src} delay={(i % INITIAL_COUNT) * 80}>
                          <Thumbnail photo={photo} onOpen={() => setOpenIndex(i)} />
                        </RevealOnScroll>
                    ) : null,
                )}
              </div>
          ))}
        </div>

        {photos.length > INITIAL_COUNT && (
            <div className="mt-8 flex justify-center">
              <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="flex cursor-pointer items-center gap-2 rounded-[10px] border-none bg-primary px-6 py-3 text-sm font-medium text-background transition-colors duration-250 hover:bg-primary-hover"
              >
                <Images className="h-5 w-5" />
                {showAll ? "Réduire la galerie" : `Voir les ${photos.length} photos`}
              </button>
            </div>
        )}

        {openIndex !== null && (
            <Lightbox photos={photos} index={openIndex} onClose={close} onChange={setOpenIndex} />
        )}
      </>
  );
};

EventGallery.propTypes = {
  photos: PropTypes.arrayOf(
      PropTypes.shape({ src: PropTypes.string.isRequired, legende: PropTypes.string }),
  ).isRequired,
  emptyMessage: PropTypes.string,
};

export default EventGallery;
