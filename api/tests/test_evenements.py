"""Tests des événements gérés depuis le panneau admin (base de test, voir conftest.py)."""
import io

FICHE = {
    "sigle": "Atelier IE 2027",
    "type": "Atelier",
    "titre": "Atelier d'intelligence économique pour les PME",
    "debut": "2027-02-10",
    "fin": "2027-02-11",
    "lieu": "Douala",
    "infos": [{"libelle": "Organisateurs", "valeur": "IE237"}],
    "programme": [
        {
            "date": "2027-02-10",
            "titre": "Ouverture",
            "lignes": [
                {"horaire": "09h00 – 09h30", "activite": "Accueil", "intervenant": "Protocole", "nature": "pause"},
                {"activite": "Matinée", "nature": "intertitre"},
                {"horaire": "09h30 – 11h00", "activite": "Module 1 – Veille : outils", "intervenant": "IE237", "nature": "module"},
            ],
        }
    ],
}


def test_cycle_evenement(client, admin):
    assert client.get("/admin/evenements").status_code == 401

    r = client.post("/admin/evenements", headers=admin, json={**FICHE, "description": "<p>Texte<script>x</script></p>"})
    assert r.status_code == 201
    evt = r.json()
    assert evt["slug"] == "atelier-ie-2027"
    assert evt["description"] == "<p>Texte</p>"
    assert evt["programme"][0]["lignes"][1]["nature"] == "intertitre"
    assert evt["photos"] == []

    # Brouillon : invisible sur le site, puis publié
    assert client.get("/evenements").json() == []
    client.patch(f"/admin/evenements/{evt['id']}", headers=admin, json={"publie": True})
    publie = client.get("/evenements/atelier-ie-2027").json()
    assert publie["infos"][0]["valeur"] == "IE237" and publie["publie_le"]

    # Dates incohérentes refusées (création et modification)
    assert client.post("/admin/evenements", headers=admin, json={**FICHE, "fin": "2027-01-01"}).status_code == 422
    assert client.patch(f"/admin/evenements/{evt['id']}", headers=admin, json={"fin": "2027-01-01"}).status_code == 400

    # Nature inconnue refusée
    mauvais = {**FICHE, "programme": [{"lignes": [{"activite": "x", "nature": "fete"}]}]}
    assert client.post("/admin/evenements", headers=admin, json=mauvais).status_code == 422


def test_fichiers_evenement(client, admin, editeur):
    evt = client.post("/admin/evenements", headers=editeur, json=FICHE).json()
    base = f"/admin/evenements/{evt['id']}"
    image = lambda: {"fichier": ("photo.webp", io.BytesIO(b"RIFF....WEBP"), "image/webp")}  # noqa: E731

    assert client.post(f"{base}/couverture", headers=editeur, files=image()).json()["couverture"].startswith("/uploads/evenements/")
    pdf = {"fichier": ("programme.pdf", io.BytesIO(b"%PDF-1.4 test"), "application/pdf")}
    assert client.post(f"{base}/document", headers=editeur, files=pdf).json()["document"].endswith(".pdf")
    assert client.delete(f"{base}/document", headers=editeur).json()["document"] is None

    client.post(f"{base}/photos", headers=editeur, files=image())
    photos = client.post(f"{base}/photos", headers=editeur, files=image()).json()["photos"]
    assert [p["ordre"] for p in photos] == [0, 1]
    chemin = photos[0]["chemin"]
    assert client.get(chemin).status_code == 200

    r = client.patch(f"{base}/photos/{photos[0]['id']}", headers=editeur, json={"legende": "Ouverture"})
    assert r.json()["photos"][0]["legende"] == "Ouverture"
    assert len(client.delete(f"{base}/photos/{photos[0]['id']}", headers=editeur).json()["photos"]) == 1
    assert client.get(chemin).status_code == 404

    # L'Éditeur ne supprime pas un événement, l'Admin si (avec ses fichiers)
    assert client.delete(base, headers=editeur).status_code == 403
    assert client.delete(base, headers=admin).status_code == 204
    assert client.get(base, headers=admin).status_code == 404
