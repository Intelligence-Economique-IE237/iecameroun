"""Tests des livrables (base de test, voir conftest.py)."""

PDF = b"%PDF-1.4\n%test\n"


def _envoyer_pdf(client, entetes, id_, contenu=PDF, nom="note.pdf"):
    return client.post(
        f"/admin/livrables/{id_}/fichier",
        headers=entetes,
        files={"fichier": (nom, contenu, "application/pdf")},
    )


def test_editeur_consulte_sans_modifier(client, editeur, analyste):
    id_ = client.post("/admin/livrables", headers=analyste, json={"titre": "Étude"}).json()["id"]
    assert client.get("/admin/livrables", headers=editeur).status_code == 200
    assert client.post("/admin/livrables", headers=editeur, json={"titre": "x"}).status_code == 403
    assert client.patch(f"/admin/livrables/{id_}", headers=editeur, json={"titre": "y"}).status_code == 403
    assert _envoyer_pdf(client, editeur, id_).status_code == 403


def test_cycle_livrable(client, analyste):
    # Création : brouillon, étiquette "Étude" par défaut, pas encore de PDF
    r = client.post("/admin/livrables", headers=analyste, json={"titre": "Note de veille", "description": "Filière cacao"})
    assert r.status_code == 201
    livrable = r.json()
    assert livrable["etiquette"] == "Étude" and livrable["fichier"] is None and not livrable["publie"]
    id_ = livrable["id"]

    # Publication refusée sans PDF
    assert client.patch(f"/admin/livrables/{id_}", headers=analyste, json={"publie": True}).status_code == 400
    assert client.get("/livrables").json() == []

    # Envoi du PDF puis publication → visible sur le site, PDF téléchargeable
    r = _envoyer_pdf(client, analyste, id_)
    assert r.status_code == 200
    chemin = r.json()["fichier"]
    assert chemin.startswith("/uploads/livrables/") and chemin.endswith(".pdf")
    r = client.patch(f"/admin/livrables/{id_}", headers=analyste, json={"publie": True, "etiquette": "Note"})
    assert r.json()["publie_le"] is not None and r.json()["etiquette"] == "Note"
    assert [l["id"] for l in client.get("/livrables").json()] == [id_]
    assert client.get(chemin).content == PDF

    # Remplacement du PDF : l'ancien fichier disparaît
    nouveau = _envoyer_pdf(client, analyste, id_).json()["fichier"]
    assert nouveau != chemin
    assert client.get(chemin).status_code == 404


def test_fichiers_refuses(client, analyste):
    id_ = client.post("/admin/livrables", headers=analyste, json={"titre": "X"}).json()["id"]
    assert _envoyer_pdf(client, analyste, id_, nom="photo.jpg").status_code == 400
    # Faux PDF : un autre fichier renommé en .pdf
    assert _envoyer_pdf(client, analyste, id_, contenu=b"MZ\x90\x00 pas un pdf").status_code == 400
    assert client.post("/admin/livrables", headers=analyste, json={"titre": ""}).status_code == 422


def test_droits_livrables(client, admin, analyste):
    assert client.get("/admin/livrables").status_code == 401
    id_ = client.post("/admin/livrables", headers=analyste, json={"titre": "À garder"}).json()["id"]
    _envoyer_pdf(client, analyste, id_)
    assert client.delete(f"/admin/livrables/{id_}", headers=analyste).status_code == 403
    chemin = client.get(f"/admin/livrables/{id_}", headers=admin).json()["fichier"]
    assert client.delete(f"/admin/livrables/{id_}", headers=admin).status_code == 204
    assert client.get(chemin).status_code == 404  # le PDF est supprimé du disque
