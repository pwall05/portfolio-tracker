# Mobile Portfolio PWA Project Seed

## Goal

Create the fastest useful mobile version of the portfolio app as a read-only iPhone-friendly PWA.

The mobile app should roll up existing portfolio, company, thesis, and basket information from Paul's Obsidian vault into a compact mobile viewer. It should create zero additional recurring upkeep work.

Core rule:

```text
Obsidian remains the source of truth.
The mobile app only displays rolled-up data.
No mobile editing. No mobile-only data.
```

## Current Project

Actual app path:

```text
/Users/paulmm/ProjectFolder/portfolio-tracker
```

Note: `/Users/paulmm/Documents/PorfolioAppWithGrok` exists but is currently empty. Use the project above.

Current stack:

- Next.js `16.1.6`
- React `19.2.3`
- TypeScript
- Tailwind CSS 4
- SQLite via `better-sqlite3`
- Financial Modeling Prep data ingest
- Playwright smoke test setup

Important scripts:

```bash
npm run dev
npm run build
npm run lint
npm run db:init
npm run ingest:fmp
```

Current env vars:

```text
FMP_API_KEY=...
DB_PATH="./data/portfolio.db"
SYNC_TOKEN="..."
```

Existing database:

```text
/Users/paulmm/ProjectFolder/portfolio-tracker/data/portfolio.db
```

Current SQLite tables:

- `companies`
- `income_statements`
- `cash_flow_statements`
- `balance_sheets`
- `sync_logs`

Current DB has four companies loaded:

- `AAPL`
- `MSFT`
- `NVDA`
- `TSLA`

## Current App Surface

Existing routes:

- `/` - portfolio overview, holdings, transaction mock UI, position summary, right sidebar insight/thesis cards
- `/logic` - investment logic/mindmap view
- `/financial` - financial history and sync UI
- `/company/[symbol]` - company thesis detail

Existing API routes:

- `/api/market/quotes?symbols=AAPL,MSFT`
- `/api/admin/sync` using `x-sync-token`

Important current files:

```text
src/app/page.tsx
src/app/layout.tsx
src/app/company/[symbol]/page.tsx
src/app/logic/page.tsx
src/app/financial/page.tsx
src/lib/data/service.ts
src/lib/data/portfolio.ts
src/lib/data/company.ts
src/lib/data/logic.ts
src/lib/data/financialDb.ts
src/lib/db.ts
src/lib/sync.ts
scripts/db-init.mjs
scripts/ingest-fmp.mjs
```

Current limitation:

- Much of the portfolio/thesis data in the app is still static sample data in `src/lib/data/portfolio.ts`, `src/lib/data/company.ts`, and `src/lib/data/logic.ts`.
- The app already has FMP/SQLite financial plumbing, but the full Obsidian thesis graph is not yet wired in.

Known lint status at seed time:

- `npm run lint` fails because `src/lib/sync.ts` uses explicit `any` types on three FMP statement upsert helpers.
- There is one warning for an unused `previousCash` variable in `src/lib/data/service.ts`.

## Source Of Truth

Active vault path:

```text
/Users/paulmm/Documents/Obsidian Vault
```

Active portfolio data contract:

```text
/Users/paulmm/Documents/Obsidian Vault/99 System/Workflows/Investment Portfolio Project Data Contract - Current.md
```

Use this current contract, not the older historical contract.

Canonical folders:

```text
03 Entities/Companies
04 Thesis/Company
04 Thesis/Investment
01 Sources
02 Content
06 Intelligence
09 Proposed Updates/Thesis
```

For this mobile PWA, only the first three are required for the initial useful version:

```text
03 Entities/Companies
04 Thesis/Company
04 Thesis/Investment
```

## Data Contract Rules

For portfolio display:

- Company facts live in `03 Entities/Companies`.
- Company thesis assignments live in `04 Thesis/Company`.
- Investment thesis labels/documents live in `04 Thesis/Investment`.
- Source evidence lives in `01 Sources` and `02 Content`.

For each portfolio company:

1. Join `04 Thesis/Company` to `03 Entities/Companies` using the `company` link or ticker when available.
2. Read `primary_thesis` from `04 Thesis/Company`.
3. Read `basket` from `04 Thesis/Company`.
4. Read factual company details from `03 Entities/Companies`.
5. If `primary_thesis` or `basket` is missing from the company thesis note, show the company as incomplete or unassigned.
6. Do not infer or backfill `primary_thesis` or `basket` from company profile body links, old metadata, source notes, or context maps.

Company profile holding-state field:

```yaml
status: currently holding | watching
```

Company profile may link to thesis:

```yaml
company_thesis: "[[04 Thesis/Company/TICKER - Short Thesis Name]]"
```

Company thesis minimal frontmatter:

```yaml
company: "[[03 Entities/Companies/TICKER - Company Name]]"
primary_thesis: "[[04 Thesis/Investment/Short Thesis|Short Thesis]]"
basket: Basket Name
```

Valid/common basket vocabulary:

- `Custom Silicon`
- `Photonics`
- `Networking`
- `Memory`
- `Energy`
- `Compute`
- `Cooling`
- `Data Center`
- `Edge`
- `Ecosystem`
- `Foundry`
- `Frontier`
- `Full Stack`
- `Robotics`
- `Other`

Do not revive these legacy fields:

- `root_thesis`
- `thesis_paths`
- `context_maps`
- `conviction`
- `position_status`
- `chokepoint_basket`

Validation warnings to surface in the app:

- Company thesis missing `company`
- Company thesis missing `primary_thesis`
- Company thesis missing `basket`
- Company thesis `primary_thesis` does not point to `04 Thesis/Investment`
- Company thesis `primary_thesis` points to `06 Intelligence`
- Company thesis has legacy rich fields added back
- Company profile contains `primary_thesis`, `basket`, `chokepoint_basket`, `thesis_paths`, `context_maps`, or `root_thesis`
- Investment thesis note in `04 Thesis/Investment` is missing `type`

## Sample Real Vault Notes

Example company thesis:

```text
/Users/paulmm/Documents/Obsidian Vault/04 Thesis/Company/AAOI - Applied Optoelectronics AI Optics Thesis.md
```

Important frontmatter:

```yaml
company: "[[03 Entities/Companies/AAOI - Applied Optoelectronics]]"
primary_thesis: "[[04 Thesis/Investment/AGI Happens/Bottleneck Thesis/Optical Interconnect Bottleneck|Optical Interconnect Bottleneck]]"
basket: Photonics
```

Example company profile:

```text
/Users/paulmm/Documents/Obsidian Vault/03 Entities/Companies/AAOI - Applied Optoelectronics.md
```

Important frontmatter:

```yaml
type: company
ticker: AAOI
name: Applied Optoelectronics
status: currently holding
sector: Photonics / Semiconductors
asset_type: Stock
company_thesis: "[[AAOI - Applied Optoelectronics AI Optics Thesis]]"
```

Example investment thesis:

```text
/Users/paulmm/Documents/Obsidian Vault/04 Thesis/Investment/AGI Happens/Data Center Build Out.md
```

Important frontmatter:

```yaml
type: thesis
status: active
title: Data Center Build Out
thesis_parent: "[[AGI Happens|AGI Wins]]"
thesis_path: AGI Wins > Data Center Build Out
```

## Product Scope

Build a mobile-first read-only PWA.

Priority order:

1. Portfolio view
2. Company thesis detail when tapped
3. Thesis view grouped by basket
4. Sort/filter by thesis
5. Data issue warnings
6. PWA install polish

Non-goals for this phase:

- No editing
- No transaction ledger
- No add/import buttons
- No weekly report
- No mobile note creation
- No app-specific portfolio data
- No push notifications
- No native iOS app shell

## Mobile Navigation

Use bottom tabs on mobile:

- Portfolio
- Thesis
- Issues

Optional fourth tab later:

- Financials

Desktop can keep or adapt the existing sidebar navigation, but mobile should feel like the primary target.

## Portfolio View

This is the default first screen.

Required:

- Show current holdings first.
- Show watchlist second or behind a filter.
- Show ticker, company name, basket, primary thesis, status.
- Include live price/day change/market cap where existing FMP data is available.
- Let user group or sort by:
  - basket
  - primary thesis
  - ticker/company
- Tap company card to open company thesis.

Avoid:

- Ledger tables
- Transaction entry
- Add/import buttons
- Large desktop-style right sidebar

Recommended mobile card fields:

```text
Ticker
Company name
Status
Basket
Primary thesis label
Current price / day change
One short thesis/current-view excerpt
```

## Company Thesis Detail

This replaces the current desktop right sidebar/company thesis experience.

Required:

- Company name/ticker
- Status: currently holding/watching
- Basket
- Primary thesis
- Snapshot/facts from company profile
- Core thesis or core claim section
- Current view section, if present
- Risks/bear case section, if present
- Evidence or why this company specifically, if present
- What would change my mind, if present
- Link-like navigation to related primary thesis/company where available

Implementation note:

- Extract body sections from Markdown by heading.
- Start with a pragmatic parser that recognizes common headings:
  - `Core Thesis`
  - `Core Claim`
  - `Current View`
  - `Variant Perception`
  - `Dissenting View`
  - `Evidence`
  - `Why This Company Specifically`
  - `Risks / Bear Case`
  - `Counter-Arguments & Risks`
  - `How I'm Playing It`
  - `What Would Change My Mind`
  - `Investment Implications`

## Thesis View

Purpose:

- Show the logic of each portfolio basket.
- Make it easy to understand which companies express each basket/thesis.

Required:

- Default grouped by `basket`.
- Each basket shows companies inside it.
- Each company row/card shows its primary thesis and short thesis logic.
- Allow sort/group by `primary_thesis`.
- Tap a company to open company thesis detail.
- Tap a primary thesis to see the investment thesis note summary if implemented.

Recommended hierarchy:

```text
Basket
  Company
    Primary thesis
    Short current-view/core-thesis excerpt
```

Optional later:

```text
Primary thesis
  Basket
    Company
```

## Issues View

Purpose:

- Show contract/data problems without requiring hidden terminal checks.
- Make vault cleanup easy later without creating mobile editing.

Required issue examples:

- Missing basket
- Missing primary thesis
- Missing company link
- Profile contains forbidden legacy fields
- Investment thesis missing `type`
- Primary thesis points outside `04 Thesis/Investment`

Each issue should show:

```text
Severity
Company or file
Problem
Suggested fix if obvious
```

No editing from mobile.

## Data Rollup Design

Recommended fastest architecture:

```text
Obsidian Vault
  -> local extractor
    -> normalized JSON snapshot
      -> Next.js app/API
        -> mobile PWA
```

Recommended generated file:

```text
data/mobile-snapshot.json
```

This keeps the mobile app read-only and avoids a new database requirement for the first pass.

Suggested snapshot shape:

```ts
type MobilePortfolioSnapshot = {
  generatedAt: string;
  companies: MobileCompany[];
  baskets: MobileBasket[];
  theses: MobileThesis[];
  issues: DataIssue[];
};

type MobileCompany = {
  ticker: string;
  name: string;
  status: "currently holding" | "watching" | "unknown";
  assetType?: string;
  sector?: string;
  companyProfilePath: string;
  companyThesisPath?: string;
  basket?: string;
  primaryThesis?: {
    label: string;
    path: string;
  };
  profileSummary?: {
    oneLiner?: string;
    whyItMatters?: string;
    financialSnapshot?: string;
    keyRisks?: string[];
  };
  thesisSections?: {
    coreThesis?: string;
    currentView?: string;
    dissentingView?: string;
    evidence?: string[];
    risks?: string[];
    investmentImplications?: string;
    whatWouldChangeMyMind?: string;
  };
  market?: {
    price?: string;
    dayChange?: string;
    marketCap?: string;
  };
};

type MobileBasket = {
  name: string;
  companyTickers: string[];
};

type MobileThesis = {
  label: string;
  path: string;
  type?: string;
  status?: string;
  summary?: string;
  thesisPath?: string;
  companyTickers: string[];
};

type DataIssue = {
  severity: "warning" | "error";
  filePath: string;
  ticker?: string;
  code: string;
  message: string;
  suggestedFix?: string;
};
```

## Extractor Requirements

Build a script similar to:

```text
scripts/build-mobile-snapshot.mjs
```

Dependencies likely needed:

- `gray-matter` for frontmatter
- Markdown parsing can start simple; use structured parsing if complexity grows

Extractor should:

1. Read company profiles from `03 Entities/Companies`.
2. Read company thesis notes from `04 Thesis/Company`.
3. Read investment thesis notes from `04 Thesis/Investment`.
4. Parse YAML frontmatter.
5. Parse key Markdown body sections.
6. Join company thesis to company profile via `company` link, `company_thesis`, or ticker fallback.
7. Use `04 Thesis/Company` as the only source for `primary_thesis` and `basket`.
8. Generate validation issues.
9. Write `data/mobile-snapshot.json`.

Suggested command:

```json
{
  "scripts": {
    "snapshot:mobile": "node scripts/build-mobile-snapshot.mjs"
  }
}
```

Optional later:

- Run snapshot generation before build.
- Add a local scheduled job if desired.
- Add manual "refresh snapshot" command only on Mac, not on mobile.

## API Requirements

Add read-only API endpoints:

```text
GET /api/mobile/snapshot
GET /api/mobile/companies
GET /api/mobile/companies/[ticker]
GET /api/mobile/baskets
GET /api/mobile/issues
```

For fastest build, `/api/mobile/snapshot` can be enough, with filtering done client-side.

API should:

- Read `data/mobile-snapshot.json`.
- Optionally merge current FMP quote data for visible tickers.
- Never mutate vault files.
- Never expose secrets.

## PWA Requirements

Add:

- Web app manifest
- App icon
- Apple touch icon
- Mobile-safe viewport theme
- Home Screen title such as `Portfolio`
- Cache last snapshot in browser storage or via service worker if simple

Install target:

- Open hosted/local reachable URL in Safari on iPhone.
- Add to Home Screen.
- Launch as a standalone-feeling app.

## Design Direction

Mobile should be dense, calm, and useful. This is an operational portfolio tool, not a marketing page.

Avoid:

- Hero sections
- Decorative visuals
- Big empty cards
- Nested cards
- Ledger/table-heavy layouts on mobile
- Purple/blue gradient-heavy theme
- In-app instructional text

Prefer:

- Bottom tabs
- Compact filter chips/segmented controls
- Fast search
- Company cards
- Grouped lists
- Sticky sort/filter bar
- Clearly surfaced data freshness
- Small issue badges

Current visual style is dark zinc/white with rounded cards. It can be kept, but mobile should reduce visual bulk.

## Suggested Implementation Plan

Phase 1 - Prepare data:

1. Fix current lint issues enough to keep the base clean.
2. Add `scripts/build-mobile-snapshot.mjs`.
3. Add `npm run snapshot:mobile`.
4. Generate `data/mobile-snapshot.json`.
5. Add validation issues to the snapshot.

Phase 2 - Add read-only mobile API:

1. Add `/api/mobile/snapshot`.
2. Optionally merge quotes using existing `getFmpQuotes`.
3. Keep auth simple for local/private use, but do not expose mutation endpoints.

Phase 3 - Build mobile PWA UI:

1. Add responsive mobile layout.
2. Make Portfolio the first screen.
3. Remove/hide ledger/add/import UI on mobile.
4. Add grouping by basket and primary thesis.
5. Add company detail screen powered by snapshot.
6. Add thesis/basket rollup screen.
7. Add issues screen.

Phase 4 - PWA install polish:

1. Add manifest and icons.
2. Add app metadata.
3. Test in mobile viewport.
4. Test on actual iPhone.

## Acceptance Criteria

The first successful version is done when:

- The app can be opened on iPhone from the Home Screen.
- Portfolio view loads first.
- No editing controls appear.
- Holdings/watchlist roll up from Obsidian vault data.
- Companies can be grouped/sorted by basket.
- Companies can be grouped/sorted by primary thesis.
- Tapping a company opens its thesis detail.
- Thesis view defaults to basket grouping.
- Each basket shows the logic for the companies inside it.
- Data issues are visible without touching the vault.
- Updating Obsidian and regenerating the snapshot updates mobile output.
- No new recurring manual data entry is introduced.

## Explicit Product Decisions Already Made

- Use fastest option: mobile PWA, not native iOS for now.
- Zero editing.
- Zero mobile-only state.
- Portfolio view is the main priority.
- Company thesis should be accessible on tap.
- Sorting/grouping by thesis matters.
- Basket-grouped thesis view matters.
- Ledger is out of scope.
- Weekly report is out of scope for the mobile app right now.
- Full experience is not required; useful rollup is the goal.


---

## Post-Seed Evolution & Codex Review (2026-06)

The project has advanced beyond the initial seed:

- A full `scripts/build-mobile-snapshot.mjs` now extracts companies, baskets, theses, holdings, signals, and issues from the live Obsidian vault + latest weekly portfolio report data packet.
- The app at runtime uses `src/lib/mobile/snapshot.ts` + `getMobileSnapshotWithMarket()` (FMP quotes layered on top).
- Auth was added (simple password + session cookie via middleware in `src/proxy.ts` and `/api/auth/login`).
- Mobile/PWA focus with responsive views.

### Codex Review Fixes Implemented (P1/P2)

All findings from the external review were agreed with and addressed:

1. **Snapshot deploy (P1)**: `data/` was fully gitignored, so `npm run snapshot:mobile` output was never in the repo. Fresh deploys (Vercel etc.) would always show the empty "snapshot_missing" state.
   - `.gitignore` updated to `!data/mobile-snapshot.json` (explicit allow).
   - README clarified: generate then **commit** the snapshot.
   - Current `data/mobile-snapshot.json` (72 companies etc.) can now be committed.

2. **Auth lockout in prod (P1)**: README omitted `APP_PASSWORD`/`APP_SESSION_SECRET`. In prod, missing password → redirects to login → login returns 503 → app unusable.
   - `src/proxy.ts`: auth bypass now happens whenever `APP_PASSWORD` is not set (all environments). Setting the password enables protection.
   - Login route and README updated with clear guidance.
   - If no password → fully open app (sensible default for personal tool).

3. **Open redirect (P2)**: `LoginForm.tsx` did `router.replace(searchParams.get("next") || "/")` with no validation.
   - Now sanitizes to only allow paths starting with `/` but not `//` (same-origin relative only).

4. **Inconsistent snapshot path (P2)**: Generator respected `MOBILE_SNAPSHOT_PATH`, reader was hardcoded.
   - `src/lib/mobile/snapshot.ts` now does the same env lookup as the generator script.

Additional:
- README deploy + environment sections expanded with auth and snapshot requirements.
- `npm run snapshot:mobile` continues to work and produces rich data (companies + weekly report holdings/signals + issues for schema problems).

The Obsidian vault (especially weekly reports under 20 Personal/Weekly/Reports/Data and the Entities/Thesis folders) remains the single source of truth.

Reconciliation note: There are other similar folders (`/Users/paulmm/portfolio-tracker`, `~/.openclaw/portfolio-app`). The `ProjectFolder/portfolio-tracker` is treated as the current mobile/PWA target per the seed. The weekly report generator in the main portfolio dashboard feeds data into the snapshot here.
