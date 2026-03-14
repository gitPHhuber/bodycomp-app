-- ============================================================
-- 005_dxa_consent.sql
-- Consent fields on users + dxa_results table
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. Extend users with profile & consent fields
-- ──────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS birth_year          INT,
  ADD COLUMN IF NOT EXISTS gender              TEXT,
  ADD COLUMN IF NOT EXISTS height_cm           NUMERIC,
  ADD COLUMN IF NOT EXISTS consent_health_data BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_health_data_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_marketing   BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_marketing_at  TIMESTAMPTZ;

-- ──────────────────────────────────────────────
-- 2. DXA results
-- ──────────────────────────────────────────────
CREATE TABLE dxa_results (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id),
  scan_date         DATE        NOT NULL,
  clinic_name       TEXT,
  scan_type         TEXT        NOT NULL DEFAULT 'initial',
  fat_pct           NUMERIC,
  muscle_mass_kg    NUMERIC,
  bone_mass_kg      NUMERIC,
  visceral_fat_area NUMERIC,
  t_score_spine     NUMERIC,
  t_score_hip       NUMERIC,
  report_url        TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dxa_results_user_id ON dxa_results (user_id);
CREATE INDEX idx_dxa_results_scan_date ON dxa_results (scan_date);

-- ──────────────────────────────────────────────
-- 3. RLS for dxa_results
-- ──────────────────────────────────────────────
ALTER TABLE dxa_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_own_dxa"
  ON dxa_results FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "auth_insert_own_dxa"
  ON dxa_results FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "auth_update_own_dxa"
  ON dxa_results FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ──────────────────────────────────────────────
-- 4. Storage bucket for DXA PDF reports
--    NOTE: Run via Supabase Dashboard → Storage → New bucket "dxa-reports" (public: false)
--    Or use: INSERT INTO storage.buckets (id, name, public) VALUES ('dxa-reports', 'dxa-reports', false);
-- ──────────────────────────────────────────────
