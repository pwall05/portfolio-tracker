# Portfolio Tracker

## Getting Started

```bash
npm run dev
```

Open http://localhost:3000

## Environment

Create `.env.local` with:

```
FMP_API_KEY=your_key_here
DB_PATH="./data/portfolio.db"
SYNC_TOKEN="your_sync_token"
```

## Data Sync (local)

Initialize the local SQLite DB and ingest FMP data:

```bash
npm run db:init
npm run ingest:fmp
```

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel.
3. Set env vars in Vercel Project Settings:
   - `FMP_API_KEY`
   - `SYNC_TOKEN`
   - (Optional) `DB_PATH` (Vercel has ephemeral storage; local DB won’t persist there)

Notes:
- The sync endpoint uses `SYNC_TOKEN` in the request header `x-sync-token`.
- On Vercel, SQLite is ephemeral. For persistent storage, move to a hosted DB later.
