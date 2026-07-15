# Mosque Management & Ledger Web App

A full-stack mosque management application with three role-based dashboards:

- **Public / Resident** — prayer times, announcements, feedback, and (after login) household payment history.
- **Admin** — payments, invoices (PDF + print), WhatsApp reminders, residents, announcements, reports, settings.
- **Caretaker** — a simple mobile-first form for posting daily prayer times.

Tech stack: **React + Vite + Tailwind CSS** (frontend), **Netlify Functions** (backend API), **Neon Postgres** (database), **JWT** auth, **jsPDF** for invoices/reports, and **wa.me** links for WhatsApp messaging (no WhatsApp API/account needed).

---

## 1. Project Structure

```
Mosque/
  netlify.toml              # redirects (/api/* -> functions), build & dev config, scheduled function
  db/migrations/             # SQL schema
  db/seed/                   # (seeding is done via scripts/seed.js)
  scripts/migrate.js         # applies db/migrations/*.sql
  scripts/seed.js            # inserts demo admin/caretaker/households/prayer-times/announcements
  netlify/functions/         # all backend API endpoints (see API section below)
  client/                    # React app (Vite)
```

## 2. Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database (free tier is enough)
- The [Netlify CLI](https://docs.netlify.com/cli/get-started/) (already added as a dev dependency — no global install needed)

## 3. First-Time Setup

### 3.1 Provision Neon

1. Create a free account/project at https://console.neon.tech
2. Create a database (e.g. `mosque`)
3. Copy the connection string shown (starts with `postgresql://...`)

### 3.2 Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=<your Neon connection string>
JWT_SECRET=<a long random string, e.g. `openssl rand -hex 32`>
JWT_EXPIRES_IN=7d
```

### 3.3 Install dependencies

```bash
npm install            # root: function deps, migrate/seed scripts, netlify-cli
cd client && npm install && cd ..   # frontend deps
```

### 3.4 Run migrations & seed demo data

```bash
npm run migrate
npm run seed
```

The seed script prints demo credentials, also listed here:

| Role      | Identifier               | Password       |
|-----------|---------------------------|----------------|
| Admin     | `admin@mosque.local`       | `Admin@123`    |
| Caretaker | `caretaker@mosque.local`   | `Caretaker@123`|
| Resident  | `+15550001111` (phone)     | `Resident@123` |

Two of the three seeded households are given an outstanding balance so the admin payments dashboard has data to show right away.

## 4. Local Development

Run everything (frontend + API functions) together with Netlify Dev:

```bash
npm run dev
```

This starts Netlify Dev on **http://localhost:8888** — it proxies the Vite dev server and serves `/api/*` via the local functions runtime. Use `:8888`, not `:5173`, so the `/api` redirects in `netlify.toml` are in effect.

(If you prefer running the Vite dev server directly on `:5173` for faster HMR, run `netlify functions:serve` in one terminal and `cd client && npm run dev` in another — `client/vite.config.js` already proxies `/api` to `:8888`.)

## 5. API Overview

All endpoints are served under `/api/*` (see `netlify.toml` for the exact redirect table) and implemented as individual files in `netlify/functions/`. Highlights:

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/login/resident\|admin\|caretaker`, `GET /api/auth/me` |
| Households | `GET/POST /api/households`, `GET/PUT/PATCH /api/households/:id`, `GET/PUT /api/households/me`, `PUT /api/households/me/password`, `GET /api/households/:id/payments`, `GET /api/households/me/payments` |
| Payments | `GET /api/payments?mode=pending\|summary`, `POST /api/payments`, `GET /api/payments/:id`, `POST /api/admin/run-monthly-charge` |
| Announcements | `GET /api/announcements[?admin=1]`, `POST/PUT/PATCH/DELETE /api/announcements/:id` |
| Prayer Times | `GET /api/prayer-times/today`, `GET /api/prayer-times/week`, `GET/POST /api/prayer-times`, `POST /api/prayer-times/bulk` |
| Feedback | `POST /api/feedback`, `GET /api/feedback[?status=&category=]`, `GET /api/feedback/me`, `PATCH /api/feedback/:id` |
| Reminders | `GET /api/reminders/eligible`, `POST /api/reminders/generate`, `GET /api/reminders` |
| Reports | `GET /api/reports/pending`, `GET /api/reports/reconciliation?month=&year=` |
| Settings | `GET /api/settings[?admin=1]`, `PUT /api/settings` |
| Admin Users | `GET/POST /api/admin-users`, `PATCH /api/admin-users/:id` |

Auth: send `Authorization: Bearer <token>` (token returned by the login endpoints). Roles are `admin`, `caretaker`, `resident`; each protected endpoint checks the role via `netlify/functions/_shared/auth.js`.

### Ledger model

- `households.current_balance` is a running balance kept in sync transactionally whenever a `charges` or `payments` row is inserted.
- A scheduled function (`scheduled-monthly-charge.js`, cron `0 0 1 * *` in `netlify.toml`) charges every active household its `monthly_contribution` on the 1st of each month. Admins can also trigger this manually via `POST /api/admin/run-monthly-charge` (useful for demos, since Netlify scheduled functions don't run under local dev).
- "Days overdue" is derived as `CURRENT_DATE - next_due_date` (floored at 0), not stored.

### PDF & Print

Invoices and reports are generated **client-side** with `jsPDF`/`jspdf-autotable` (`client/src/lib/pdf/`). The on-screen/print view (`InvoiceView.jsx`, `PendingReportView.jsx`, `ReconciliationReportView.jsx`) and the PDF builder both consume the same data model, so the two stay visually consistent even though they're rendered by different engines. Printing uses the browser's native `window.print()` with a `@media print` stylesheet (`client/src/index.css`) that isolates the `#print-root` element.

### WhatsApp

No WhatsApp Business API or credentials are used. `client/src/lib/whatsapp.js` builds a `https://wa.me/<phone>?text=<message>` link and a clipboard-copy helper; the admin reviews/edits the message, then either copies it or opens WhatsApp with the text pre-filled and sends manually.

## 6. Deploying to Netlify

1. Push this repository to GitHub/GitLab/Bitbucket (or use `netlify deploy` directly from the CLI).
2. In the Netlify dashboard, "Add new site" → "Import an existing project" → pick the repo.
3. Build settings (already encoded in `netlify.toml`, should auto-detect):
   - Build command: `npm run build:client`
   - Publish directory: `client/dist`
   - Functions directory: `netlify/functions`
4. Under **Site settings → Environment variables**, add:
   - `DATABASE_URL` — your Neon connection string (use a production Neon branch/project, not your local dev one, if you want separate data)
   - `JWT_SECRET` — a long random string (different from local, ideally)
   - `JWT_EXPIRES_IN` — e.g. `7d`
5. Deploy. Then run migrations/seed against the **production** database from your machine (point `DATABASE_URL` in a local shell at the prod connection string temporarily, or keep a separate `.env.production`):
   ```bash
   DATABASE_URL=<prod-connection-string> node scripts/migrate.js
   DATABASE_URL=<prod-connection-string> node scripts/seed.js   # optional, demo data only
   ```
6. The scheduled monthly-charge function (`netlify.toml` → `[functions."scheduled-monthly-charge"]`) is picked up automatically by Netlify Scheduled Functions on deploy — no extra setup needed.

For a fresh production deployment you'll likely want to skip `npm run seed` and instead create real households/admin users through the Admin dashboard (Settings → Admin Users, Residents → Add Household) after logging in with a manually-inserted first admin user — see below.

### Creating the first production admin user

The seed script is meant for local demos. For production, either:
- Temporarily point `DATABASE_URL` at production and run a one-off script similar to `scripts/seed.js`'s admin-insert block with your real email/password, or
- Insert directly via SQL using a bcrypt hash you generate locally:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 10))"
  ```
  then `INSERT INTO users (email, password_hash, role, full_name) VALUES ('you@example.com', '<hash>', 'admin', 'Your Name');`

## 7. Notes & Known Simplifications

- "Event calendar", "recent committee works", and "donation/fund highlights" are all surfaced through the Announcements feed using its category tags (`event`, `maintenance`, `fund`, `general`) rather than as separate dedicated widgets — filter/scan the feed by category instead of a standalone calendar view.
- Hijri date shown on the header is a civil/tabular approximation (not moon-sighting verified) — expect it to be off by up to a day near month boundaries.
- All households are billed uniformly on the 1st of each month; there's no per-household billing-day configuration.
- Announcement images are stored as compressed base64 data URLs directly on the row (no object storage) — fine at mosque scale, but not meant for large media libraries.
- The app is served same-origin (SPA + functions both behind Netlify's `/api` redirect), so no CORS configuration was needed for the deployed site. `_shared/response.js` still sends permissive CORS headers in case you ever call the API from a different origin during development.
