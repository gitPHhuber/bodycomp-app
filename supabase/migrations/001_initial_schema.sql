-- ============================================================
-- 001_initial_schema.sql
-- Phase 0: Foundation tables for bodycomp-app
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. USERS
-- ──────────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE,
  tg_id       BIGINT UNIQUE,
  name        TEXT,
  city        TEXT,
  source      TEXT NOT NULL DEFAULT 'website',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_tg_id ON users (tg_id);

-- ──────────────────────────────────────────────
-- 2. EVENTS (core analytics)
-- ──────────────────────────────────────────────
CREATE TABLE events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id),
  session_id  TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  page        TEXT,
  element     TEXT,
  meta        JSONB,
  source      TEXT NOT NULL DEFAULT 'website',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_created_at  ON events (created_at);
CREATE INDEX idx_events_event_type  ON events (event_type);
CREATE INDEX idx_events_session_id  ON events (session_id);

-- ──────────────────────────────────────────────
-- 3. CALC_RESULTS
-- ──────────────────────────────────────────────
CREATE TABLE calc_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  session_id      TEXT NOT NULL,
  height_cm       NUMERIC NOT NULL,
  weight_kg       NUMERIC NOT NULL,
  age             INT NOT NULL,
  gender          TEXT NOT NULL,
  waist_cm        NUMERIC,
  hip_cm          NUMERIC,
  neck_cm         NUMERIC,
  fat_pct         NUMERIC NOT NULL,
  muscle_kg       NUMERIC,
  visceral_level  TEXT,
  bmi             NUMERIC NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calc_results_user_id ON calc_results (user_id);

-- ──────────────────────────────────────────────
-- 4. QUIZ_RESULTS
-- ──────────────────────────────────────────────
CREATE TABLE quiz_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  session_id  TEXT NOT NULL,
  quiz_slug   TEXT NOT NULL,
  score       INT NOT NULL DEFAULT 0,
  answers     JSONB NOT NULL DEFAULT '{}',
  share_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- 5. CLINICS
-- ──────────────────────────────────────────────
CREATE TABLE clinics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  city          TEXT NOT NULL,
  address       TEXT NOT NULL,
  lat           NUMERIC,
  lng           NUMERIC,
  phone         TEXT,
  price_from    INT NOT NULL,
  price_to      INT,
  working_hours TEXT,
  partner_tier  TEXT NOT NULL DEFAULT 'standard',
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- 6. BOOKINGS
-- ──────────────────────────────────────────────
CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  clinic_id     UUID NOT NULL REFERENCES clinics(id),
  desired_date  DATE,
  status        TEXT NOT NULL DEFAULT 'pending',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ
);

-- ──────────────────────────────────────────────
-- 7. WAITLIST
-- ──────────────────────────────────────────────
CREATE TABLE waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  city        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- 8. BOT_CONFIG
-- ──────────────────────────────────────────────
CREATE TABLE bot_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- 9. CONTENT
-- ──────────────────────────────────────────────
CREATE TABLE content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  media_url   TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ
);

-- ──────────────────────────────────────────────
-- 10. ADMIN_USERS
-- ──────────────────────────────────────────────
CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calc_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- EVENTS: anon can INSERT; no SELECT for anon (admin reads via service role)
CREATE POLICY "anon_insert_events"
  ON events FOR INSERT TO anon
  WITH CHECK (true);

-- CALC_RESULTS: anon can INSERT; no SELECT for anon
CREATE POLICY "anon_insert_calc_results"
  ON calc_results FOR INSERT TO anon
  WITH CHECK (true);

-- QUIZ_RESULTS: anon can INSERT
CREATE POLICY "anon_insert_quiz_results"
  ON quiz_results FOR INSERT TO anon
  WITH CHECK (true);

-- CLINICS: anon can SELECT active clinics (public catalog)
CREATE POLICY "anon_select_clinics"
  ON clinics FOR SELECT TO anon
  USING (active = true);

-- WAITLIST: anon can INSERT
CREATE POLICY "anon_insert_waitlist"
  ON waitlist FOR INSERT TO anon
  WITH CHECK (true);

-- CONTENT: anon can SELECT active content
CREATE POLICY "anon_select_content"
  ON content FOR SELECT TO anon
  USING (active = true);
