def _login(client, email, password):
    return client.post("/api/v1/auth/login", data={"username": email, "password": password}).json()["access_token"]


def _setup(client):
    admin_token = _login(client, "admin@example.com", "admin")
    h = {"Authorization": f"Bearer {admin_token}"}
    r = client.post("/api/v1/products", json={"name": "Widget", "price": 9.99, "stock": 5}, headers=h)
    return r.json()["id"]


def test_cart_and_checkout(client):
    pid = _setup(client)
    client.post("/api/v1/auth/register", json={"email": "buyer@example.com", "password": "secret"})
    token = _login(client, "buyer@example.com", "secret")
    h = {"Authorization": f"Bearer {token}"}
    r = client.post("/api/v1/cart/items", json={"product_id": pid, "quantity": 2}, headers=h)
    assert r.status_code == 201
    r = client.get("/api/v1/cart", headers=h)
    assert r.json()["items"][0]["quantity"] == 2
    r = client.post("/api/v1/orders", headers=h)
    assert r.status_code == 201
    assert r.json()["total"] == 19.98
    r = client.get("/api/v1/orders", headers=h)
    assert len(r.json()) == 1
    r = client.get(f"/api/v1/products/{pid}")
    assert r.json()["stock"] == 3


def test_empty_cart_checkout_fails(client):
    client.post("/api/v1/auth/register", json={"email": "buyer2@example.com", "password": "secret"})
    token = _login(client, "buyer2@example.com", "secret")
    h = {"Authorization": f"Bearer {token}"}
    r = client.post("/api/v1/orders", headers=h)
    assert r.status_code == 400
