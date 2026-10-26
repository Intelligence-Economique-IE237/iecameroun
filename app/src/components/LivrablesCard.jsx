import MagicBento from './MagicBento';

const livrables = [
    {
        title: 'Policy Brief — L\'or camerounais',
        description: 'Synthèse des activités et perspectives',
        label: 'Étude',
        pdfUrl: '/Docs/PolicyBrief-l-or-camerounais.pdf'
    },
    {
        title: 'Note de veille Économique et Stratégique',
        description:
            'Balance Commerciale Camerounaise, Filière Coton, Filière Soja',
        label: 'Étude',
        pdfUrl: '/Docs/Note_veille_economique_et_strategique2.pdf'
    },
    {
        title: 'Fiche d\'Analyse',
        description: 'Analyse de l\'économie camerounaise',
        label: 'Étude',
        pdfUrl: '/Docs/Fiche_Cameroun_fiche_economique.pdf'
    },
    {
        title: 'Fiche d\'Analyse',
        description: 'Analyse du secteur minier camerounais',
        label: 'Étude',
        pdfUrl: '/Docs/Fiche_analyse_les_mineraux_critiques_au_cameroun.pdf'
    },
];

const Livrables = () => {
    return (
        <MagicBento
            pdfs={livrables}
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