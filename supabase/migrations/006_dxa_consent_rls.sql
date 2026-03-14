-- ============================================================
-- 006_dxa_consent_rls.sql
-- Enforce consent_health_data in DXA RLS policies
-- Users must have granted health-data consent to access their DXA rows
-- ============================================================

-- Drop existing user-level policies that don't check consent
DROP POLICY IF EXISTS "auth_select_own_dxa" ON dxa_results;
DROP POLICY IF EXISTS "auth_insert_own_dxa" ON dxa_results;
DROP POLICY IF EXISTS "auth_update_own_dxa" ON dxa_results;
DROP POLICY IF EXISTS "auth_select_own_dxa_results" ON dxa_results;
DROP POLICY IF EXISTS "auth_insert_own_dxa_results" ON dxa_results;

-- Recreate with consent_health_data check
CREATE POLICY "auth_select_own_dxa"
  ON dxa_results FOR SELECT TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid() AND consent_health_data = true)
  );

CREATE POLICY "auth_insert_own_dxa"
  ON dxa_results FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid() AND consent_health_data = true)
  );

CREATE POLICY "auth_update_own_dxa"
  ON dxa_results FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid() AND consent_health_data = true)
  )
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid() AND consent_health_data = true)
  );
