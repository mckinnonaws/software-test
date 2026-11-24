from app.core.config import settings


def test_version(client):
    r = client.get("/version")
    assert r.status_code == 200
    assert r.json() == {"version": settings.app_version}


def test_api_v1_version(client):
    r = client.get(f"{settings.api_v1_prefix}/version")
    assert r.status_code == 200
    assert r.json() == {"version": settings.app_version}
