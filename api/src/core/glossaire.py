"""Glossaire de la traduction automatique : la terminologie d'IE237, imposée au service.

Chaque entrée sert deux fois :
1. un texte affiché qui correspond EXACTEMENT à une entrée (majuscules et espaces ignorés),
   comme un menu ou un titre de carte, reçoit directement cette traduction ;
2. dans les phrases, DeepL reçoit ce glossaire et respecte ces termes (en accordant le reste).

Si un mauvais terme anglais revient malgré tout, l'ajouter dans CORRECTIONS (en bas).

Pour corriger une traduction : ajouter ou modifier une ligne ici, puis redéployer l'API.
Les traductions déjà en cache sont alors refaites automatiquement.

Conseil : écrire chaque terme en minuscules ET, s'il apparaît aussi ainsi sur le site,
avec sa majuscule (DeepL distingue les deux).
"""

GLOSSAIRE: dict[str, dict[str, str]] = {
    "en": {
        # --- Nom et statut (ne pas traduire) ---
        "IE237": "IE237",
        "Intelligence Économique 237": "Intelligence Économique 237",
        "Think-Do Tank": "Think-Do Tank",
        # --- Intelligence économique ---
        "intelligence économique": "competitive intelligence",
        "Intelligence économique": "Competitive intelligence",
        "Intelligence Économique": "Competitive Intelligence",
        "intelligence économique territoriale": "territorial competitive intelligence",
        "Intelligence économique territoriale": "Territorial competitive intelligence",
        "Intelligence Économique Territoriale": "Territorial Competitive Intelligence",
        "Intelligence Économique & Analyse stratégique": "Competitive Intelligence & Strategic Analysis",
        # --- Veille ---
        "veille": "monitoring",
        "Veille": "Monitoring",
        "veille stratégique": "strategic monitoring",
        "Veille stratégique": "Strategic monitoring",
        "veille concurrentielle": "competitor monitoring",
        "veille économique": "economic monitoring",
        "veille technologique": "technology monitoring",
        "Veille technologique": "Technology monitoring",
        "veille législative et réglementaire": "legislative and regulatory monitoring",
        "Veille législative et réglementaire": "Legislative and regulatory monitoring",
        "notes de veille": "monitoring briefs",
        "Veille & analyse": "Monitoring & analysis",
        "Veille & analyse concurrentielle": "Competitor monitoring & analysis",
        "Innovation & veille technologique": "Innovation & technology monitoring",
        # --- Notions du domaine ---
        "guerre économique": "economic warfare",
        "guerre informationnelle": "information warfare",
        "guerre cognitive": "cognitive warfare",
        "contre-ingérence": "counter-interference",
        "sécurité économique": "economic security",
        "signaux faibles": "weak signals",
        "aide à la décision": "decision support",
        "souveraineté économique": "economic sovereignty",
        "Influence & lobbying": "Influence & lobbying",
        # --- Phrases du site ---
        "Un Think-Do Tank républicain": "A republican Think-Do Tank",
    },
}

# Corrections appliquées APRÈS la traduction, quoi que le service ait proposé.
# Filet de sécurité : remplace un mot anglais par un autre (mots entiers, majuscules conservées).
# Prise en compte immédiate, sans retraduire le cache.
CORRECTIONS: dict[str, dict[str, str]] = {
    "en": {
        "business intelligence": "competitive intelligence",
        "economic intelligence": "competitive intelligence",
        "market intelligence": "monitoring",
        "intelligence watch": "monitoring",
    },
}
