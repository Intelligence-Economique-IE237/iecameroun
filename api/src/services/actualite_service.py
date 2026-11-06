"""Logique métier des actualités : tout ce qui touche à la base passe par ici.

Circuit de validation :
  brouillon ──soumettre──▶ soumis ──valider──▶ valide ──publier──▶ publie
      ▲                      │                   │                   │
      └──── a_corriger ◀─renvoyer────────────────┘        retirer ───┘ (retour à « valide »)

- Éditeur : rédige (brouillon, à corriger), soumet, publie et retire un article validé.
- Analyste : corrige le texte d'un article soumis, validé ou publié, valide ou renvoie avec un commentaire.
- Admin : peut tout faire, à toute étape (publication directe comprise).
"""
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlmodel import Session, select

from src.core.erreurs import DonneesInvalides, Interdit, Introuvable
from src.models import Role, Utilisateur
from src.models.actualite import Actualite, LectureActualite, Statut, maintenant
from src.schemas.actualite import ActualiteCreation, ActualiteModification, ChangementStatut
from src.services import fichier_service
from src.services.slug import slug_unique
from src.services.texte_riche import nettoyer_html

S = Statut
FUSEAU = ZoneInfo("Africa/Douala")  # les jours sont comptés à l'heure du Cameroun


def aujourdhui() -> date:
    return datetime.now(FUSEAU).date()

# Statuts où chaque rôle peut modifier le texte et l'image
MODIFIABLE_PAR = {
    Role.EDITEUR.value: {S.BROUILLON, S.A_CORRIGER},
    Role.ANALYSTE.value: {S.SOUMIS, S.VALIDE, S.PUBLIE},
}

# action → (rôles autorisés hors Admin, statuts de départ possibles, statut d'arrivée)
TRANSITIONS = {
    "soumettre": ({Role.EDITEUR.value}, {S.BROUILLON, S.A_CORRIGER}, S.SOUMIS),
    "valider": ({Role.ANALYSTE.value}, {S.SOUMIS}, S.VALIDE),
    "renvoyer": ({Role.ANALYSTE.value}, {S.SOUMIS, S.VALIDE}, S.A_CORRIGER),
    "publier": ({Role.EDITEUR.value}, {S.VALIDE}, S.PUBLIE),
    "retirer": ({Role.EDITEUR.value}, {S.PUBLIE}, S.VALIDE),
}

LIBELLES = {
    S.BROUILLON: "brouillon",
    S.SOUMIS: "en attente de validation",
    S.A_CORRIGER: "à corriger",
    S.VALIDE: "validé",
    S.PUBLIE: "publié",
}


def _slug_unique(session: Session, titre: str, id_actuel: int | None = None) -> str:
    return slug_unique(session, Actualite, titre, id_actuel, defaut="actualite")


def _enregistrer(session: Session, actu: Actualite) -> Actualite:
    session.add(actu)
    session.commit()
    session.refresh(actu)
    return actu


def _verifier_modifiable(actu: Actualite, utilisateur: Utilisateur) -> None:
    if utilisateur.role == Role.ADMIN.value:
        return
    statut = S(actu.statut)
    if statut not in MODIFIABLE_PAR.get(utilisateur.role, set()):
        raise Interdit(f"Cet article est {LIBELLES[statut]} : votre rôle ne peut pas le modifier à cette étape.")


# ---------- Lecture ----------

def lister_publiees(session: Session) -> list[Actualite]:
    requete = (
        select(Actualite)
        .where(Actualite.publie == True)  # noqa: E712
        .order_by(Actualite.publie_le.desc())
    )
    return list(session.exec(requete).all())


def trouver_publiee(session: Session, slug: str) -> Actualite:
    actu = session.exec(
        select(Actualite).where(Actualite.slug == slug, Actualite.publie == True)  # noqa: E712
    ).first()
    if not actu:
        raise Introuvable("Actualité introuvable")
    return actu


def lister_toutes(session: Session) -> list[Actualite]:
    return list(session.exec(select(Actualite).order_by(Actualite.modifie_le.desc())).all())


def trouver(session: Session, id_: int) -> Actualite:
    actu = session.get(Actualite, id_)
    if not actu:
        raise Introuvable("Actualité introuvable")
    return actu


# ---------- Écriture ----------

def creer(session: Session, donnees: ActualiteCreation, auteur: Utilisateur) -> Actualite:
    actu = Actualite(
        **donnees.model_dump(),
        slug=_slug_unique(session, donnees.titre),
        auteur_id=auteur.id,
        auteur=auteur.nom or auteur.email,
    )
    actu.contenu = nettoyer_html(actu.contenu)
    return _enregistrer(session, actu)


def modifier(session: Session, id_: int, donnees: ActualiteModification, utilisateur: Utilisateur) -> Actualite:
    actu = trouver(session, id_)
    _verifier_modifiable(actu, utilisateur)
    changements = donnees.model_dump(exclude_unset=True)

    if "contenu" in changements:
        changements["contenu"] = nettoyer_html(changements["contenu"])
    if "titre" in changements and changements["titre"] != actu.titre:
        # L'adresse d'un article déjà en ligne ne change pas (liens partagés)
        if not actu.publie_le:
            actu.slug = _slug_unique(session, changements["titre"], actu.id)

    for champ, valeur in changements.items():
        setattr(actu, champ, valeur)
    actu.modifie_le = maintenant()
    return _enregistrer(session, actu)


def changer_statut(session: Session, id_: int, demande: ChangementStatut, utilisateur: Utilisateur) -> Actualite:
    actu = trouver(session, id_)
    roles, depart, arrivee = TRANSITIONS[demande.action]
    statut = S(actu.statut)
    commentaire = demande.commentaire.strip()

    if utilisateur.role != Role.ADMIN.value and utilisateur.role not in roles:
        raise Interdit("Action non autorisée pour votre rôle")
    # L'Admin peut publier ou retirer à toute étape ; les autres suivent le circuit
    admin_direct = utilisateur.role == Role.ADMIN.value and demande.action in ("publier", "retirer")
    if statut not in depart and not (admin_direct and statut != arrivee):
        raise DonneesInvalides(f"Impossible : l'article est {LIBELLES[statut]}.")
    if demande.action == "renvoyer" and len(commentaire) < 3:
        raise DonneesInvalides("Indiquez à l'auteur ce qu'il faut corriger.")

    instant = maintenant()
    if demande.action == "soumettre":
        actu.soumis_le = instant
    elif demande.action in ("valider", "renvoyer"):
        actu.commentaire = commentaire
        if demande.action == "valider":
            actu.valide_par = utilisateur.nom or utilisateur.email
            actu.valide_le = instant
    elif demande.action == "publier":
        # La date de publication est fixée la première fois qu'on publie
        actu.publie_le = actu.publie_le or instant
    elif demande.action == "retirer" and statut != S.PUBLIE:
        arrivee = statut  # rien à retirer

    actu.statut = arrivee.value
    actu.publie = arrivee == S.PUBLIE
    actu.modifie_le = instant
    return _enregistrer(session, actu)


def supprimer(session: Session, id_: int) -> None:
    actu = trouver(session, id_)
    fichier_service.supprimer_fichier(actu.image)
    session.delete(actu)
    session.commit()


def changer_image(session: Session, id_: int, contenu: bytes, nom_fichier: str, utilisateur: Utilisateur) -> Actualite:
    actu = trouver(session, id_)
    _verifier_modifiable(actu, utilisateur)
    nouveau_chemin = fichier_service.enregistrer_image(contenu, nom_fichier, "actualites")
    fichier_service.supprimer_fichier(actu.image)  # remplace l'ancienne image
    actu.image = nouveau_chemin
    actu.modifie_le = maintenant()
    return _enregistrer(session, actu)


# ---------- Lectures ----------

def compter_lecture(session: Session, slug: str) -> None:
    """+1 lecture sur un article publié (total et compteur du jour, en une transaction)."""
    actu = trouver_publiee(session, slug)
    actu.lectures += 1
    session.add(actu)
    session.exec(
        insert(LectureActualite)
        .values(actualite_id=actu.id, jour=aujourdhui(), nombre=1)
        .on_conflict_do_update(
            index_elements=["actualite_id", "jour"],
            set_={"nombre": LectureActualite.nombre + 1},
        )
    )
    session.commit()


def _par_jour(session: Session, debut: date, actualite_id: int | None = None) -> list[dict]:
    """Lectures des jours depuis « debut » jusqu'à aujourd'hui, jours sans lecture compris."""
    requete = (
        select(LectureActualite.jour, func.sum(LectureActualite.nombre))
        .where(LectureActualite.jour >= debut)
        .group_by(LectureActualite.jour)
    )
    if actualite_id is not None:
        requete = requete.where(LectureActualite.actualite_id == actualite_id)
    comptes = {jour: int(n) for jour, n in session.exec(requete).all()}
    nb_jours = (aujourdhui() - debut).days + 1
    return [
        {"jour": debut + timedelta(days=i), "nombre": comptes.get(debut + timedelta(days=i), 0)}
        for i in range(nb_jours)
    ]


def _resume(par_jour: list[dict], total: int) -> dict:
    return {
        "total": total,
        "sur_7_jours": sum(j["nombre"] for j in par_jour[-7:]),
        "sur_30_jours": sum(j["nombre"] for j in par_jour),
        "par_jour": par_jour,
    }


def statistiques(session: Session) -> dict:
    debut = aujourdhui() - timedelta(days=29)
    total = session.exec(select(func.coalesce(func.sum(Actualite.lectures), 0))).one()
    plus_lus = session.exec(
        select(Actualite)
        .where(Actualite.lectures > 0)
        .order_by(Actualite.lectures.desc(), Actualite.publie_le.desc())
        .limit(5)
    ).all()
    return {
        **_resume(_par_jour(session, debut), int(total)),
        "plus_lus": [{"id": a.id, "titre": a.titre, "slug": a.slug, "lectures": a.lectures} for a in plus_lus],
    }


def lectures_article(session: Session, id_: int) -> dict:
    actu = trouver(session, id_)
    debut = aujourdhui() - timedelta(days=29)
    return _resume(_par_jour(session, debut, actu.id), actu.lectures)
