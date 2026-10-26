import { useState } from "react";
import PropTypes from "prop-types";
import { Images, Loader2 } from "lucide-react";

const photos = [
    { src: "/IMG_8202.JPG.jpeg", alt: "CONFERENCE SUR L'IMPORT SUBSTITUTION • DSHANG • JUILLET 2026" },
    { src: "/IMG_5159.JPG-1.webp", alt: "JAIE • ENAM • MAI 2026" },
    { src: "/IMG_2797.webp", alt: "CONFERNCE OMC • PALAIS DES CONGRES • MARS 2026" },
    { src: "/0D1A0453.webp", alt: "JAIE • ENAM • MAI 2026" },
    { src: "/IMG_4124.JPG.jpeg", alt: "JAIE • ENAM • MAI 2026" },
    { src: "/IMG_2584.JPG.webp", alt: "CONFERNCE OMC • PALAIS DES CONGRES • MARS 2026" },
    { src: "/IMG_0411.JPG.webp", alt: "JAIE • ENAM • MAI 2026" },
    { src: "/IMG_4858.jpg", alt: "CEMPRA AEGC • GPE NGOA-ÉKÉLÉ • OCT 2026" },
];

const INITIAL_COUNT = 4;

const GalleryImage = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-sm bg-surface-alt">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 text-primary animate-spin" />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoaded(true)}
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                    loaded ? "opacity-100" : "opacity-0"
                }`}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent px-5 pt-12 pb-4 flex flex-col gap-2">
                <span className="w-7 h-[2px] bg-accent rounded-full" />
                <span className="text-white/95 text-[13px] sm:text-sm font-normal tracking-wide leading-snug">
                    {alt}
                </span>
            </div>
        </div>
    );
};

GalleryImage.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
};

const Gallery = ({ className = "" }) => {
    const [showAll, setShowAll] = useState(false);

    const visiblePhotos = showAll ? photos : photos.slice(0, INITIAL_COUNT);
    const hasMore = photos.length > INITIAL_COUNT;

    const colLeft = visiblePhotos.filter((_, i) => i % 2 === 0);
    const colRight = visiblePhotos.filter((_, i) => i % 2 === 1);

    return (
        <section
            id="galerie"
            className={`relative w-full bg-background py-16 md:py-20 px-6 sm:px-10 lg:px-[113px] text-left font-[Poppins] ${className}`}
        >
            <div className="max-w-[1440px] mx-auto flex flex-col gap-10">
                <div className="flex flex-col gap-3 max-w-[560px]">
                    <b className="uppercase text-sm text-accent tracking-wide">
                        Galerie
                    </b>
                    <h2 className="m-0 text-[28px] sm:text-[32px] lg:text-[40px] tracking-[-0.02em] leading-tight font-bold text-heading">
                        Nos moments forts
                    </h2>
                    <p className="m-0 text-base text-muted">
                        Conférences, formations et rencontres institutionnelles au cœur de notre activité.
                    </p>
                </div>

                <div className="relative">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-4">
                            {colLeft.map((photo) => (
                                <GalleryImage key={photo.src} src={photo.src} alt={photo.alt} />
                            ))}
                        </div>
                        <div className="flex flex-col gap-4 pt-10">
                            {colRight.map((photo) => (
                                <GalleryImage key={photo.src} src={photo.src} alt={photo.alt} />
                            ))}
                        </div>
                    </div>
                </div>

                {hasMore && (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => setShowAll((v) => !v)}
                            className="flex items-center gap-2 cursor-pointer border-none px-6 py-3 bg-primary hover:bg-primary-hover transition-colors duration-250 rounded-[10px] text-background text-sm font-medium"
                        >
                            <Images className="h-5 w-5" />
                            {showAll ? "Réduire la galerie" : "Voir la galerie complète"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

Gallery.propTypes = {
    className: PropTypes.string,
};

export default Gallery;