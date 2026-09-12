# Support (operator app)

Vite + React app for activity logs. Default port **5174**.

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Open http://localhost:5174. The API must be running (`docker compose up -d` from the repo root) with Timescale (`LOGS_DATABASE_URL`). If the logs store is unset, the page shows an unavailable state.

Verify locally: `pnpm verify`.
