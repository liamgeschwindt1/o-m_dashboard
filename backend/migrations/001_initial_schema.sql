-- O&M Studio — initial schema migration
-- Run once against the Railway Postgres instance before first deploy.

-- Extension required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── instructors ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS instructors (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        UNIQUE NOT NULL,
  name       TEXT,
  org_code   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── routes ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID        REFERENCES instructors(id),
  name          TEXT        NOT NULL,
  payload       JSONB       NOT NULL,
  status        TEXT        DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_instructor_id ON routes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_routes_status        ON routes(status);

-- ── route_recipients ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_recipients (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id  UUID        REFERENCES routes(id),
  email     TEXT        NOT NULL,
  sent_at   TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_route_recipients_route_id ON route_recipients(route_id);

-- ── route_views ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_views (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id  UUID        REFERENCES routes(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_views_route_id ON route_views(route_id);
