-- ============================================================
-- 005_dxa_results_reminders.sql
-- Таблица dxa_results, reminders, поле consent_marketing
-- ============================================================

BEGIN;

-- ════════════════════════════════════════════════
-- 1. ТАБЛИЦА dxa_results
-- ════════════════════════════════════════════════

CREATE TABLE dxa_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_date             DATE NOT NULL,
  total_fat_pct         NUMERIC,
  lean_mass_kg          NUMERIC,
  bone_mass_kg          NUMERIC,
  visceral_fat_area_cm2 NUMERIC,
  scan_type             TEXT NOT NULL DEFAULT 'primary',
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dxa_results_scan_type_check CHECK (scan_type IN ('primary', 'repeat'))
);

CREATE INDEX idx_dxa_results_user_id   ON dxa_results (user_id);
CREATE INDEX idx_dxa_results_scan_date ON dxa_results (scan_date DESC);

ALTER TABLE dxa_results ENABLE ROW LEVEL SECURITY;

-- Authenticated: SELECT own
CREATE POLICY "auth_select_own_dxa_results"
  ON dxa_results FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Authenticated: INSERT own
CREATE POLICY "auth_insert_own_dxa_results"
  ON dxa_results FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Admin: full CRUD
CREATE POLICY "admin_select_dxa_results"
  ON dxa_results FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_insert_dxa_results"
  ON dxa_results FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_dxa_results"
  ON dxa_results FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_delete_dxa_results"
  ON dxa_results FOR DELETE TO authenticated
  USING (public.is_admin());

-- ════════════════════════════════════════════════
-- 2. ТАБЛИЦА reminders
-- ════════════════════════════════════════════════

CREATE TABLE reminders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  remind_at   TIMESTAMPTZ NOT NULL,
  type        TEXT NOT NULL,
  channel     TEXT NOT NULL DEFAULT 'email',
  sent        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reminders_user_id ON reminders (user_id);
CREATE INDEX idx_reminders_pending ON reminders (remind_at) WHERE sent = false;

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Authenticated: SELECT own
CREATE POLICY "auth_select_own_reminders"
  ON reminders FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Authenticated: INSERT own
CREATE POLICY "auth_insert_own_reminders"
  ON reminders FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Admin: full CRUD
CREATE POLICY "admin_select_reminders"
  ON reminders FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_insert_reminders"
  ON reminders FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_reminders"
  ON reminders FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_delete_reminders"
  ON reminders FOR DELETE TO authenticated
  USING (public.is_admin());

-- ════════════════════════════════════════════════
-- 3. ALTER users: consent_marketing
-- ════════════════════════════════════════════════

ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false;

COMMIT;
