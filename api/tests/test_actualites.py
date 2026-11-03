"""Tests de bout en bout : connexion + actualités (base de test, voir conftest.py)."""
import io

from tests.conftest import EMAIL_ADMIN


def test_connexion(client, admin):
    assert client.post("/auth/login", data={"username": EMAIL_ADMIN, "password": "faux"}).status_code == 401
    moi = client.get("/auth/moi", headers=admin).json()
    assert moi["email"] == EMAIL_ADMIN and moi["role"] == "admin"


def test_routes_admin_protegees(client):
    assert client.get("/admin/actualites").status_code == 401
    assert client.post("/admin/actualites", json={"titre": "x"}).status_code == 401


def test_cycle_actualite(client, admin):
    # Création en brouillon : invisible sur le site
    r = client.post("/admin/actualites", headers=admin, json={"titre": "Clôture MOPIET à Yaoundé"})
    assert r.status_code == 201
    actu = r.json()
    assert actu["slug"] == "cloture-mopiet-a-yaounde"
    assert actu["publie_le"] is None
    assert client.get("/actualites").json() == []

    # Même titre → slug différent
    r2 = client.post("/admin/actualites", headers=admin, json={"titre": "Clôture MOPIET à Yaoundé"})
    assert r2.json()["slug"] == "cloture-mopiet-a-yaounde-2"

    # Publication → visible sur le site
    r = client.patch(f"/admin/actualites/{actu['id']}", headers=admin, json={"publie": True})
    assert r.json()["publie_le"] is not None
    assert [a["slug"] for a in client.get("/actualites").json()] == ["cloture-mopiet-a-yaounde"]
    assert client.get("/actualites/cloture-mopiet-a-yaounde").status_code == 200

    # Suppression
    assert client.delete(f"/admin/actualites/{actu['id']}", headers=admin).status_code == 204
    assert client.get(f"/admin/actualites/{actu['id']}", headers=admin).status_code == 404


def test_image(client, admin):
    actu = client.post("/admin/actualites", headers=admin, json={"titre": "Avec image"}).json()
    url = f"/admin/actualites/{actu['id']}/image"

    r = client.post(url, headers=admin, files={"fichier": ("doc.pdf", b"%PDF", "application/pdf")})
    assert r.status_code == 400

    r = client.post(url, headers=admin, files={"fichier": ("photo.webp", io.BytesIO(b"RIFF....WEBP"), "image/webp")})
    assert r.status_code == 200
    chemin = r.json()["image"]
    assert chemin.startswith("/uploads/actualites/")
    assert client.get(chemin).status_code == 200

