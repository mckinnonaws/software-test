def test_frontend_index(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "text/html" in r.headers["content-type"]
    assert "AnyCompany Demo Store" in r.text


def test_frontend_assets(client):
    assert client.get("/styles.css").status_code == 200
    assert client.get("/app.js").status_code == 200
