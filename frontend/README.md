# AnyCompany Frontend

Next.js 14 TypeScript frontend for the AnyCompany store API.

## Local development

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` to your FastAPI backend URL.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Vercel

Deploy this repository with the project root set to `frontend/`, or use the root `vercel.json`. Configure `NEXT_PUBLIC_API_BASE_URL` in the Vercel project environment variables. Ensure the backend allows the deployed origin in `CORS_ORIGINS`.
