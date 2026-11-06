"""Circuit de validation des actualités et compteur de lectures (base de test, voir conftest.py)."""


def _action(client, entetes, id_, action, commentaire=""):
    return client.post(f"/admin/actualites/{id_}/statut", headers=entetes, json={"action": action, "commentaire": commentaire})


def test_circuit_complet(client, admin, editeur, analyste):
    # L'Analyste ne rédige pas
    assert client.post("/admin/actualites", headers=analyste, json={"titre": "x"}).status_code == 403

    actu = client.post("/admin/actualites", headers=editeur, json={"titre": "Note cacao", "contenu": "<p>V1</p>"}).json()
    id_ = actu["id"]
    assert actu["statut"] == "brouillon"

    # Brouillon : l'Analyste ne voit pas encore à valider, ne peut ni modifier ni valider
    assert client.patch(f"/admin/actualites/{id_}", headers=analyste, json={"titre": "y"}).status_code == 403
    assert _action(client, analyste, id_, "valider").status_code == 400

    # L'Éditeur soumet : il ne peut plus modifier
    r = _action(client, editeur, id_, "soumettre")
    assert r.json()["statut"] == "soumis" and r.json()["soumis_le"]
    assert client.patch(f"/admin/actualites/{id_}", headers=editeur, json={"titre": "z"}).status_code == 403

    # L'Analyste renvoie : commentaire obligatoire
    assert _action(client, analyste, id_, "renvoyer").status_code == 400
    r = _action(client, analyste, id_, "renvoyer", "Sourcer le chiffre du 2e paragraphe")
    assert r.json()["statut"] == "a_corriger" and r.json()["commentaire"].startswith("Sourcer")

    # L'Éditeur corrige et resoumet
    assert client.patch(f"/admin/actualites/{id_}", headers=editeur, json={"contenu": "<p>V2 sourcée</p>"}).status_code == 200
    _action(client, editeur, id_, "soumettre")

    # L'Analyste corrige lui-même une coquille puis valide
    r = client.patch(f"/admin/actualites/{id_}", headers=analyste, json={"contenu": "<p>V2 sourcée.</p>"})
    assert r.status_code == 200
    r = _action(client, analyste, id_, "valider", "RAS")
    assert r.json()["statut"] == "valide" and r.json()["valide_par"] == "Analyste"
    # Ni l'Éditeur ne valide, ni l'Analyste ne publie
    assert _action(client, analyste, id_, "publier").status_code == 403
    assert client.get("/actualites").json() == []

    # L'Éditeur publie → en ligne
    r = _action(client, editeur, id_, "publier")
    assert r.json()["statut"] == "publie" and r.json()["publie"] and r.json()["publie_le"]
    assert [a["id"] for a in client.get("/actualites").json()] == [id_]
    assert client.patch(f"/admin/actualites/{id_}", headers=editeur, json={"titre": "w"}).status_code == 403

    # Retrait du site : retour à « valide »
    r = _action(client, editeur, id_, "retirer")
    assert r.json()["statut"] == "valide" and not r.json()["publie"]
    assert client.get("/actualites").json() == []


def test_admin_peut_tout(client, admin, editeur):
    id_ = client.post("/admin/actualites", headers=editeur, json={"titre": "Urgent"}).json()["id"]
    assert _action(client, admin, id_, "publier").json()["statut"] == "publie"
    assert client.patch(f"/admin/actualites/{id_}", headers=admin, json={"resume": "Corrigé"}).status_code == 200


def test_slug_stable_apres_publication(client, admin):
    id_ = client.post("/admin/actualites", headers=admin, json={"titre": "Premier titre"}).json()["id"]
    _action(client, admin, id_, "publier")
    r = client.patch(f"/admin/actualites/{id_}", headers=admin, json={"titre": "Nouveau titre"})
    assert r.json()["slug"] == "premier-titre"


def test_lectures(client, admin):
    id_ = client.post("/admin/actualites", headers=admin, json={"titre": "Lue"}).json()["id"]
    # Article non publié : pas de lecture comptée
    assert client.post("/actualites/lue/lecture").status_code == 404
    _action(client, admin, id_, "publier")

    for _ in range(3):
        assert client.post("/actualites/lue/lecture").status_code == 204
    # Les robots ne comptent pas
    client.post("/actualites/lue/lecture", headers={"User-Agent": "Googlebot/2.1"})
    client.post("/actualites/lue/lecture", headers={"User-Agent": "WhatsApp/2.23"})

    assert client.get(f"/admin/actualites/{id_}", headers=admin).json()["lectures"] == 3
    stats = client.get("/admin/actualites/statistiques", headers=admin).json()
    assert stats["total"] == 3 and stats["sur_7_jours"] == 3 and stats["sur_30_jours"] == 3
    assert len(stats["par_jour"]) == 30 and stats["par_jour"][-1]["nombre"] == 3
    assert stats["plus_lus"][0] == {"id": id_, "titre": "Lue", "slug": "lue", "lectures": 3}

    article = client.get(f"/admin/actualites/{id_}/lectures", headers=admin).json()
    assert article["total"] == 3 and article["par_jour"][-1]["nombre"] == 3
    assert client.get("/admin/actualites/statistiques").status_code == 401


def test_analyste_et_evenements(client, analyste):
    assert client.get("/admin/evenements", headers=analyste).status_code == 200
    fiche = {"sigle": "x", "titre": "x", "debut": "2027-01-01", "fin": "2027-01-01"}
    assert client.post("/admin/evenements", headers=analyste, json=fiche).status_code == 403
    assert client.get("/admin/utilisateurs", headers=analyste).status_code == 403
