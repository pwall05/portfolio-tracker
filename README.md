# Portfolio Tracker

## Getting Started

```bash
npm run snapshot:mobile
npm run dev
```

Open http://localhost:3000

## Mobile PWA Snapshot

Obsidian stays the source of truth. Regenerate the read-only mobile snapshot
after vault changes:

```bash
npm run snapshot:mobile
```

The extractor reads:

- `/Users/paulmm/Documents/Obsidian Vault/03 Entities/Companies`
- `/Users/paulmm/Documents/Obsidian Vault/04 Thesis/Company`
- `/Users/paulmm/Documents/Obsidian Vault/04 Thesis/Investment`
- the newest weekly portfolio data packet under
  `/Users/paulmm/Documents/Obsidian Vault/20 Personal/Weekly/Reports/Data`

It writes `data/mobile-snapshot.json`.

**Important for deploys:** The snapshot is the data the app serves at runtime (companies, baskets, theses, holdings, signals from your latest weekly report, etc.). After running `npm run snapshot:mobile`, **commit** `data/mobile-snapshot.json` so that GitHub/Vercel deploys include real data instead of falling back to the empty "snapshot missing" state.

The `.gitignore` explicitly allows `data/mobile-snapshot.json` while ignoring other things in `/data/`.

Set `PORTFOLIO_REPORT_DATA_PATH` to point at a specific report JSON when you
do not want the newest dated packet.

You can also override the snapshot output path with `MOBILE_SNAPSHOT_PATH` (both the generator and the app reader respect it).

## Environment

Create `.env.local` with:

```
FMP_API_KEY=your_key_here
DB_PATH="./data/portfolio.db"
SYNC_TOKEN="your_sync_token"

# Optional: enable password protection (recommended for any shared/prod deploy)
APP_PASSWORD="your-strong-password"
# Optional (falls back to APP_PASSWORD if not set)
APP_SESSION_SECRET="another-secret"
```

If `APP_PASSWORD` is not set, the entire app runs without authentication (including in production). This is by design for personal use. Set the variable to turn on the login gate.

The login form and middleware live under `/login` and the proxy logic.

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
   - (Optional but recommended for protected deploys) `APP_PASSWORD` and optionally `APP_SESSION_SECRET`
   - Make sure `data/mobile-snapshot.json` is committed (see Mobile PWA Snapshot section)

Notes:
- The sync endpoint uses `SYNC_TOKEN` in the request header `x-sync-token`.
- On Vercel, SQLite is ephemeral. For persistent storage, move to a hosted DB later.
- If you do not set `APP_PASSWORD`, the app will run without password protection (even in production). This is intentional for personal/self-hosted use. Set `APP_PASSWORD` to enable the login gate.
