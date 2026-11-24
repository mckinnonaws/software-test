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

## Health check

With the app running locally:

```bash
curl http://localhost:8000/health   # {"status":"ok"}   - app is up
curl http://localhost:8000/ready    # {"status":"ready"} - app can reach the database
```

A non-200 response from `/ready` means the database is unreachable. Check that `DATABASE_URL` (in `.env`) is correct and the database is running, then run `alembic upgrade head` and retry.

## Endpoints

- `/health`, `/ready`
- `/api/v1/auth/*`
- `/api/v1/products`
- `/api/v1/cart`
- `/api/v1/orders`
