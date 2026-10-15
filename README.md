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

TypeScript/React app in `frontend/`.

```bash
cd frontend
npm install
cp .env.example .env.local  # set VITE_API_URL to your API base URL
npm run dev
npm run typecheck
npm run build
npm test
```

## Vercel

The frontend is configured for Vercel via root `vercel.json`. Set `VITE_API_URL` in the Vercel project environment variables. Deploy from the repository root.
