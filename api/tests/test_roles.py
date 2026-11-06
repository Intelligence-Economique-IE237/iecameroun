"""Tests des rôles Admin / Éditeur / Analyste (base de test, voir conftest.py)."""
from tests.conftest import EMAIL_EDITEUR, MDP


def test_editeur_gere_le_contenu(client, editeur):
    actu = client.post("/admin/actualites", headers=editeur, json={"titre": "Par l'éditeur"})
    assert actu.status_code == 201
    id_ = actu.json()["id"]
    assert client.patch(f"/admin/actualites/{id_}", headers=editeur, json={"resume": "Texte"}).status_code == 200
    assert client.get("/admin/actualites", headers=editeur).status_code == 200
    # Pas de publication sans validation
    r = client.post(f"/admin/actualites/{id_}/statut", headers=editeur, json={"action": "publier"})
    assert r.status_code == 400


def test_editeur_ne_supprime_pas(client, admin, editeur):
    id_ = client.post("/admin/actualites", headers=editeur, json={"titre": "À garder"}).json()["id"]
    assert client.delete(f"/admin/actualites/{id_}", headers=editeur).status_code == 403
    assert client.delete(f"/admin/actualites/{id_}", headers=admin).status_code == 204


def test_editeur_ne_gere_pas_les_comptes(client, editeur):
    assert client.get("/admin/utilisateurs", headers=editeur).status_code == 403
    nouveau = {"email": "pirate@test.cm", "mot_de_passe": "x" * 12, "role": "admin"}
    assert client.post("/admin/utilisateurs", headers=editeur, json=nouveau).status_code == 403


def test_admin_gere_les_comptes(client, admin):
    # Création d'un éditeur, qui peut ensuite se connecter
    r = client.post(
        "/admin/utilisateurs",
        headers=admin,
        json={"email": "Nouveau@Test.cm", "nom": "Nouveau", "mot_de_passe": MDP},
    )
    assert r.status_code == 201
    nouveau = r.json()
    assert nouveau["email"] == "nouveau@test.cm" and nouveau["role"] == "editeur"
    assert "mot_de_passe_hash" not in nouveau
    assert client.post("/auth/login", data={"username": "nouveau@test.cm", "password": MDP}).status_code == 200

    # Email déjà utilisé, mot de passe trop court, rôle inconnu
    assert client.post("/admin/utilisateurs", headers=admin, json={"email": "nouveau@test.cm", "mot_de_passe": MDP}).status_code == 400
    assert client.post("/admin/utilisateurs", headers=admin, json={"email": "a@test.cm", "mot_de_passe": "court"}).status_code == 422
    assert client.post("/admin/utilisateurs", headers=admin, json={"email": "b@test.cm", "mot_de_passe": MDP, "role": "chef"}).status_code == 422

    # Promotion en Admin, puis suppression
    r = client.patch(f"/admin/utilisateurs/{nouveau['id']}", headers=admin, json={"role": "admin"})
    assert r.json()["role"] == "admin"
    assert client.delete(f"/admin/utilisateurs/{nouveau['id']}", headers=admin).status_code == 204
    assert len(client.get("/admin/utilisateurs", headers=admin).json()) == 3

    # Rôle Analyste
    r = client.post("/admin/utilisateurs", headers=admin, json={"email": "c@test.cm", "mot_de_passe": MDP, "role": "analyste"})
    assert r.json()["role"] == "analyste"


def test_changement_de_role_immediat(client, admin, editeur):
    # Un éditeur promu Admin obtient les droits sans se reconnecter
    utilisateurs = client.get("/admin/utilisateurs", headers=admin).json()
    id_editeur = next(u["id"] for u in utilisateurs if u["email"] == EMAIL_EDITEUR)
    assert client.get("/admin/utilisateurs", headers=editeur).status_code == 403
    client.patch(f"/admin/utilisateurs/{id_editeur}", headers=admin, json={"role": "admin"})
    assert client.get("/admin/utilisateurs", headers=editeur).status_code == 200


def test_protections(client, admin):
    moi = client.get("/auth/moi", headers=admin).json()
    # Pas d'auto-suppression
    assert client.delete(f"/admin/utilisateurs/{moi['id']}", headers=admin).status_code == 400
    # Le dernier Admin ne peut pas être rétrogradé
    r = client.patch(f"/admin/utilisateurs/{moi['id']}", headers=admin, json={"role": "editeur"})
    assert r.status_code == 400
