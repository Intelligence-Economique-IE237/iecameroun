import { FileText, Loader2 } from 'lucide-react';
import MagicBento from './MagicBento';
import { getLivrables, urlFichier, useApi } from '../api';

// Livrables publiés depuis le panneau admin (étude, note de veille, fiche…)
const Livrables = () => {
    const { donnees, chargement, erreur } = useApi(getLivrables, 'livrables');

    if (chargement) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Chargement des publications" />
            </div>
        );
    }

    if (erreur || !donnees?.length) {
        return (
            <div className="mx-5 sm:mx-10 lg:mx-24 xl:mx-36 my-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-12 text-center">
                <FileText className="h-10 w-10 text-primary" />
                <p className="m-0 text-base text-body">
                    {erreur
                        ? 'Les publications ne peuvent pas être chargées pour le moment. Réessayez dans quelques instants.'
                        : 'Aucune publication pour le moment.'}
                </p>
            </div>
        );
    }

    // Format attendu par MagicBento
    const pdfs = donnees.map((l) => ({
        title: l.titre,
        description: l.description,
        label: l.etiquette,
        pdfUrl: urlFichier(l.fichier),
    }));

    return (
        <MagicBento
            pdfs={pdfs}
            textAutoHide={true}
            enableStars
            enableSpotlight={false}
            enableBorderGlow={false}
            enableTilt
            enableMagnetism={false}
            clickEffect
            disableAnimations={false}
        />
    );
};

export default Livrables;
