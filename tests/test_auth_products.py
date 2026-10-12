def _login(client, email, password):
    r = client.post("/api/v1/auth/login", data={"username": email, "password": password})
    assert r.status_code == 200
    return r.json()["access_token"]


def test_register_and_me(client):
    r = client.post("/api/v1/auth/register", json={"email": "u@example.com", "password": "secret"})
    assert r.status_code == 201
    token = _login(client, "u@example.com", "secret")
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "u@example.com"


def test_admin_product_crud(client):
    token = _login(client, "admin@example.com", "admin")
    h = {"Authorization": f"Bearer {token}"}
    r = client.post("/api/v1/products", json={"name": "Widget", "price": 9.99, "stock": 5}, headers=h)
    assert r.status_code == 201
    pid = r.json()["id"]
    r = client.get(f"/api/v1/products/{pid}")
    assert r.status_code == 200
    r = client.put(f"/api/v1/products/{pid}", json={"stock": 3}, headers=h)
    assert r.json()["stock"] == 3
    r = client.delete(f"/api/v1/products/{pid}", headers=h)
    assert r.status_code == 204


def test_non_admin_cannot_create_product(client):
    client.post("/api/v1/auth/register", json={"email": "u2@example.com", "password": "secret"})
    token = _login(client, "u2@example.com", "secret")
    r = client.post("/api/v1/products", json={"name": "x", "price": 1, "stock": 1}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403
