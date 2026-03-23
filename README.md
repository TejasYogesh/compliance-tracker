# Compliance Tracker

React (Vite) + Node/Express + SQLite (`better-sqlite3`). Per-client task lists with pagination, filters (status, category, search), sorting, inline status updates, and a modal to create tasks. The API returns paginated JSON and a summary endpoint (totals + distinct categories). No authentication—suitable for demos or trusted use.

**Stack:** Express router → repositories → SQLite; client under `client/src/api` and `client/src/components`. Production build is copied to `server/public` and served with `/api/*` from one process. Client lint: `npm run lint --prefix client`.

## Quick start

**Node.js 20+**

```bash
npm run install:all   # installs server/ and client/ only
npm run seed
npm run dev           # waits on API default port 3007, then Vite (default UI port 5174; proxies /api)
```

Production-style (single port):

```bash
npm run install:all && npm run seed && npm run build && npm start
```

With `npm start`, open the site at your machine’s address on the port from `PORT` (default `3007`). Dependencies live under `server/` and `client/`, not the repo root.

### Docker

```bash
docker build -t compliance-tracker .
docker run --rm -p 3007:3007 -v compliance-data:/app/data \
  -e DB_PATH=/app/data/compliance.db compliance-tracker
```

Run `npm run seed` once against the same `DB_PATH` (host or `docker exec`) so the DB is populated.

## API

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/clients` | `page`, `pageSize` (max 100) → `{ items, total, page, pageSize, totalPages }` |
| `GET` | `/api/clients/:id/tasks` | Same pagination + `status`, `category`, `q`, `sort` (`due_date_asc` / `due_date_desc` / `priority`) |
| `POST` | `/api/tasks` | Create task (JSON) |
| `PATCH` | `/api/tasks/:id/status` | `{ "status": "Pending" \| "In Progress" \| "Completed" }` |
| `GET` | `/api/clients/:id/summary` | `total`, `pending`, `overdue`, `completed`, `categories` |

`400` validation errors include `details`. Missing resources → `404`.

## Data

- **Client:** `id`, `company_name`, `country`, `entity_type`
- **Task:** `id`, `client_id`, `title`, `description`, `category`, `due_date`, `status`, `priority`

Default DB: `server/data/compliance.db` (override with `DB_PATH`). Optional ad-hoc SQL checks: `server/db/sqlworkbench-verify.sql` against that file.

## Layout

| Path | Role |
|------|------|
| `server/src/app.js` | Express app |
| `server/src/routes/api.js` | REST |
| `server/db/` | Ad-hoc SQL (e.g. Workbench verify script) |
| `server/src/repositories/` | SQLite |
| `server/src/mappers/task.js` | e.g. `overdue` on tasks |

## Deploy

One Node process serves the built UI and `/api`. Build: `npm run install:all && npm run build`, start: `npm start`. The host should set `PORT`; optional `PUBLIC_BASE_URL` (no trailing slash) improves startup logs. Run `npm run seed --prefix server` once on the server. Use `DB_PATH` if you store SQLite on a mounted path. Free PaaS disks are often ephemeral—SQLite may reset unless the provider gives persistent storage. Use the **Docker** section above for a container deploy.

**Notes:** Overdue = `due_date` before today (UTC) and not `Completed`. Category filter is exact match; search matches title/description (case-insensitive).
