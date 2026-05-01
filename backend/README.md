# O&M Studio — Backend API

Node 20 + Express API service for the Touchpulse Instructor Studio. Persists routes and instructor data in Railway Postgres, and fires n8n email webhooks on share events.

---

## Local Development Setup

### 1. Prerequisites

- Node ≥ 20
- A local Postgres instance **or** the Railway CLI to proxy the remote DB

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your local values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `N8N_WEBHOOK_URL` | n8n email workflow webhook endpoint |
| `PORT` | Port to listen on (default `3000`) |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `NODE_ENV` | Set to `development` locally |

### 4. Run the database migration

```bash
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

Or via the Railway CLI against the remote database:

```bash
railway run psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

### 5. Start the dev server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/routes` | Create a new route |
| `GET` | `/api/routes` | List routes (filter: `?org_code=`) |
| `GET` | `/api/routes/:id` | Get single route + recipients |
| `PATCH` | `/api/routes/:id` | Update route status (`active` / `archived`) |
| `POST` | `/api/routes/:id/share` | Add recipient + trigger n8n email |
| `POST` | `/api/routes/:id/view` | Log anonymous view event |

### POST /api/routes — Request body

```json
{
  "name": "Route name",
  "org_code": "ORG1",
  "instructor_email": "instructor@example.com",
  "instructor_name": "Jane Smith",
  "payload": { /* full route object from frontend */ }
}
```

---

## Railway Deployment

Railway will inject `DATABASE_URL` and `PORT` automatically. You only need to add:

- `N8N_WEBHOOK_URL`
- `FRONTEND_URL` (your deployed frontend Railway domain)
- `NODE_ENV=production`

The `Dockerfile` at `backend/Dockerfile` is the build target for the Railway `backend` service.
