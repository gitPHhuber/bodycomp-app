-- ============================================================
-- 005 — Patient Personal Cabinet: tables, RLS, storage
-- ============================================================

-- ─── PART A: Extend users table ──────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('male', 'female'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_health_data BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_health_data_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_marketing_at TIMESTAMPTZ;

-- ─── PART B: DXA results ────────────────────────────────────
CREATE TABLE IF NOT EXISTS dxa_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_date DATE NOT NULL,
  clinic_id TEXT,
  scan_type TEXT CHECK (scan_type IN ('primary', 'repeat')) DEFAULT 'primary',

  -- Core metrics
  total_fat_pct NUMERIC,
  total_fat_kg NUMERIC,
  lean_mass_kg NUMERIC,
  bone_mass_kg NUMERIC,
  visceral_fat_area_cm2 NUMERIC,
  bmd_spine NUMERIC,
  bmd_hip NUMERIC,
  t_score_spine NUMERIC,
  t_score_hip NUMERIC,

  -- Segmental (optional)
  fat_trunk_pct NUMERIC,
  fat_arms_pct NUMERIC,
  fat_legs_pct NUMERIC,
  lean_arms_kg NUMERIC,
  lean_legs_kg NUMERIC,

  -- Android / Gynoid
  android_fat_pct NUMERIC,
  gynoid_fat_pct NUMERIC,
  ag_ratio NUMERIC,

  -- File & meta
  pdf_url TEXT,
  notes TEXT,
  source TEXT CHECK (source IN ('manual', 'pdf_upload', 'clinic_api')) DEFAULT 'manual',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dxa_results_user
  ON dxa_results(user_id, scan_date DESC);

-- ─── PART C: Reminders ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('repeat_scan', 'custom')) DEFAULT 'repeat_scan',
  remind_at TIMESTAMPTZ NOT NULL,
  channel TEXT CHECK (channel IN ('email', 'telegram', 'push')) DEFAULT 'email',
  status TEXT CHECK (status IN ('pending', 'sent', 'cancelled')) DEFAULT 'pending',
  related_dxa_result_id UUID REFERENCES dxa_results(id),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_pending
  ON reminders(remind_at) WHERE status = 'pending';

-- ─── PART D: Row Level Security ─────────────────────────────

-- dxa_results
ALTER TABLE dxa_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own dxa results"
  ON dxa_results FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users insert own dxa results"
  ON dxa_results FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users update own dxa results"
  ON dxa_results FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Admins manage all dxa_results"
  ON dxa_results FOR ALL
  USING (get_admin_role() IS NOT NULL);

-- reminders
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own reminders"
  ON reminders FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users manage own reminders"
  ON reminders FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Admins manage all reminders"
  ON reminders FOR ALL
  USING (get_admin_role() IS NOT NULL);

-- ─── PART E: Storage (manual step) ──────────────────────────
-- Create a PRIVATE bucket "dxa-reports" in Supabase Dashboard:
--   Supabase → Storage → New Bucket → "dxa-reports" (private)
--
-- Then add storage policies so only the file owner can read/write:
--   - SELECT: (bucket_id = 'dxa-reports') AND (auth.uid()::text = (storage.foldername(name))[1])
--   - INSERT: (bucket_id = 'dxa-reports') AND (auth.uid()::text = (storage.foldername(name))[1])
--   - DELETE: (bucket_id = 'dxa-reports') AND (auth.uid()::text = (storage.foldername(name))[1])
--
-- File upload convention: dxa-reports/{auth_uid}/{filename}.pdf
