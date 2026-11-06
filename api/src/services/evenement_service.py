"""Logique métier des événements : fiche, programme, couverture, document et galerie photos."""
from sqlmodel import Session, select

from src.core.erreurs import DonneesInvalides, Introuvable
from src.models.actualite import maintenant
from src.models.evenement import Evenement, PhotoEvenement
from src.schemas.evenement import EvenementCreation, EvenementModification
from src.services import fichier_service
from src.services.slug import slug_unique
from src.services.texte_riche import nettoyer_html

MAX_PHOTOS = 60


def _slug(session: Session, sigle: str, id_actuel: int | None = None) -> str:
    return slug_unique(session, Evenement, sigle, id_actuel, defaut="evenement")


def _photos(session: Session, evt: Evenement) -> list[PhotoEvenement]:
    requete = (
        select(PhotoEvenement)
        .where(PhotoEvenement.evenement_id == evt.id)
        .order_by(PhotoEvenement.ordre, PhotoEvenement.id)
    )
    return list(session.exec(requete).all())


def lecture(session: Session, evt: Evenement) -> dict:
    """L'événement tel que renvoyé par l'API : la fiche et ses photos."""
    return {**evt.model_dump(), "photos": [p.model_dump() for p in _photos(session, evt)]}


def _enregistrer(session: Session, evt: Evenement) -> Evenement:
    evt.modifie_le = maintenant()
    session.add(evt)
    session.commit()
    session.refresh(evt)
    return evt


# ---------- Lecture ----------

def lister_publies(session: Session) -> list[Evenement]:
    requete = select(Evenement).where(Evenement.publie == True).order_by(Evenement.debut.desc())  # noqa: E712
    return list(session.exec(requete).all())


def trouver_publie(session: Session, slug: str) -> Evenement:
    evt = session.exec(
        select(Evenement).where(Evenement.slug == slug, Evenement.publie == True)  # noqa: E712
    ).first()
    if not evt:
        raise Introuvable("Événement introuvable")
    return evt


def lister_tous(session: Session) -> list[Evenement]:
    return list(session.exec(select(Evenement).order_by(Evenement.debut.desc())).all())


def trouver(session: Session, id_: int) -> Evenement:
    evt = session.get(Evenement, id_)
    if not evt:
        raise Introuvable("Événement introuvable")
    return evt


# ---------- Fiche ----------

def creer(session: Session, donnees: EvenementCreation) -> Evenement:
    evt = Evenement(**donnees.model_dump(mode="json"), slug=_slug(session, donnees.sigle))
    evt.debut, evt.fin = donnees.debut, donnees.fin
    evt.description = nettoyer_html(evt.description)
    if evt.publie:
        evt.publie_le = maintenant()
    return _enregistrer(session, evt)


def modifier(session: Session, id_: int, donnees: EvenementModification) -> Evenement:
    evt = trouver(session, id_)
    changements = donnees.model_dump(exclude_unset=True)
    # infos et programme sont stockés en JSON : dates converties en texte AAAA-MM-JJ
    for champ in ("infos", "programme"):
        if champ in changements:
            changements[champ] = donnees.model_dump(mode="json", include={champ})[champ]

    debut = changements.get("debut", evt.debut)
    fin = changements.get("fin", evt.fin)
    if fin < debut:
        raise DonneesInvalides("La date de fin doit être après la date de début")

    if "description" in changements:
        changements["description"] = nettoyer_html(changements["description"])
    if "sigle" in changements:
        evt.slug = _slug(session, changements["sigle"], evt.id)
    # La date de publication est fixée la première fois qu'on publie
    if changements.get("publie") and not evt.publie_le:
        evt.publie_le = maintenant()

    for champ, valeur in changements.items():
        setattr(evt, champ, valeur)
    return _enregistrer(session, evt)


def supprimer(session: Session, id_: int) -> None:
    evt = trouver(session, id_)
    for photo in _photos(session, evt):
        fichier_service.supprimer_fichier(photo.chemin)
        session.delete(photo)
    session.flush()  # photos supprimées avant l'événement
    fichier_service.supprimer_fichier(evt.couverture)
    fichier_service.supprimer_fichier(evt.document)
    session.delete(evt)
    session.commit()


# ---------- Fichiers ----------

def changer_couverture(session: Session, id_: int, contenu: bytes, nom_fichier: str) -> Evenement:
    evt = trouver(session, id_)
    chemin = fichier_service.enregistrer_image(contenu, nom_fichier, "evenements")
    fichier_service.supprimer_fichier(evt.couverture)
    evt.couverture = chemin
    return _enregistrer(session, evt)


def changer_document(session: Session, id_: int, contenu: bytes, nom_fichier: str) -> Evenement:
    evt = trouver(session, id_)
    chemin = fichier_service.enregistrer_pdf(contenu, nom_fichier, "evenements")
    fichier_service.supprimer_fichier(evt.document)
    evt.document = chemin
    return _enregistrer(session, evt)


def retirer_document(session: Session, id_: int) -> Evenement:
    evt = trouver(session, id_)
    fichier_service.supprimer_fichier(evt.document)
    evt.document = None
    return _enregistrer(session, evt)


def ajouter_photo(session: Session, id_: int, contenu: bytes, nom_fichier: str) -> Evenement:
    evt = trouver(session, id_)
    photos = _photos(session, evt)
    if len(photos) >= MAX_PHOTOS:
        raise DonneesInvalides(f"La galerie est limitée à {MAX_PHOTOS} photos")
    chemin = fichier_service.enregistrer_image(contenu, nom_fichier, "evenements")
    ordre = (photos[-1].ordre + 1) if photos else 0
    session.add(PhotoEvenement(evenement_id=evt.id, chemin=chemin, ordre=ordre))
    return _enregistrer(session, evt)


def _photo(session: Session, id_: int, photo_id: int) -> PhotoEvenement:
    photo = session.get(PhotoEvenement, photo_id)
    if not photo or photo.evenement_id != id_:
        raise Introuvable("Photo introuvable")
    return photo


def legender_photo(session: Session, id_: int, photo_id: int, legende: str) -> Evenement:
    photo = _photo(session, id_, photo_id)
    photo.legende = legende
    session.add(photo)
    return _enregistrer(session, trouver(session, id_))


def supprimer_photo(session: Session, id_: int, photo_id: int) -> Evenement:
    photo = _photo(session, id_, photo_id)
    fichier_service.supprimer_fichier(photo.chemin)
    session.delete(photo)
    return _enregistrer(session, trouver(session, id_))
