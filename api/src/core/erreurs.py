"""Erreurs métier levées par les services.

Les services ne connaissent pas HTTP : ils lèvent ces erreurs, et main.py
les transforme en réponses HTTP (404, 400, 401, 403).
"""


class Introuvable(Exception):
    pass


class DonneesInvalides(Exception):
    pass


class NonAutorise(Exception):
    pass


class Interdit(Exception):
    """Action refusée pour ce rôle ou à cette étape (ex. modifier un article en relecture)."""


class ServiceIndisponible(Exception):
    """Service externe absent ou en panne (ex. traduction non configurée, quota DeepL atteint)."""


class TropDeRequetes(Exception):
    """Limite d'utilisation atteinte pour ce visiteur."""
