# Contributing

Thanks for helping improve AnyCompany Monolith!

## Proposing a change

1. Create a branch from `main` (e.g. `feature/short-description`).
2. Make your change, keeping it focused and small.
3. Add or update tests, then run them:
   ```bash
   DATABASE_URL=sqlite:///:memory: pytest -q
   ```
4. If you change the database models, add an Alembic migration.
5. Open a pull request against `main` describing what changed and why.

For larger changes, open an issue first to discuss the approach.
