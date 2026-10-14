# AnyCompany Monolith

FastAPI monolith for the shopping store.

## Run locally

```bash
pip install -r requirements.txt
cp .env.example .env  # optional
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Test

```bash
DATABASE_URL=sqlite:///:memory: pytest -q
```

## Endpoints

- `/health`, `/ready`
- `/api/v1/auth/*`
- `/api/v1/products`
- `/api/v1/cart`
- `/api/v1/orders`

## Frontend

- `/` serves the demo frontend.
- `/static` and `/assets` serve frontend assets.
