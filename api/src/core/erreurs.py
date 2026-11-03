"""Erreurs métier levées par les services.

Les services ne connaissent pas HTTP : ils lèvent ces erreurs, et main.py
les transforme en réponses HTTP (404, 400, 401).
"""


class Introuvable(Exception):
    pass


class DonneesInvalides(Exception):
    pass


class NonAutorise(Exception):
    pass
