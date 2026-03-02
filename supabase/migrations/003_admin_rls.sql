-- ============================================================
-- 003_admin_rls.sql
-- Phase 2: Admin panel — RLS policies for admin access
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. Helper: check if current user is an admin
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ──────────────────────────────────────────────
-- 2. RPC: get current user's admin role
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_admin_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.admin_users
  WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid());
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────
-- 3. Admin policies — USERS
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_all_users"
  ON users FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_update_all_users"
  ON users FOR UPDATE TO authenticated
  USING (public.is_admin());

-- ──────────────────────────────────────────────
-- 4. Admin policies — EVENTS
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_all_events"
  ON events FOR SELECT TO authenticated
  USING (public.is_admin());

-- ──────────────────────────────────────────────
-- 5. Admin policies — CALC_RESULTS
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_all_calc_results"
  ON calc_results FOR SELECT TO authenticated
  USING (public.is_admin());

-- ──────────────────────────────────────────────
-- 6. Admin policies — QUIZ_RESULTS
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_all_quiz_results"
  ON quiz_results FOR SELECT TO authenticated
  USING (public.is_admin());

-- ──────────────────────────────────────────────
-- 7. Admin policies — CLINICS (full CRUD)
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_all_clinics"
  ON clinics FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_insert_clinics"
  ON clinics FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_clinics"
  ON clinics FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_delete_clinics"
  ON clinics FOR DELETE TO authenticated
  USING (public.is_admin());

-- ──────────────────────────────────────────────
-- 8. Admin policies — BOOKINGS
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_all_bookings"
  ON bookings FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_update_bookings"
  ON bookings FOR UPDATE TO authenticated
  USING (public.is_admin());

-- ──────────────────────────────────────────────
-- 9. Admin policies — WAITLIST
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_all_waitlist"
  ON waitlist FOR SELECT TO authenticated
  USING (public.is_admin());

-- ──────────────────────────────────────────────
-- 10. Admin policies — BOT_CONFIG (full CRUD)
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_bot_config"
  ON bot_config FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_insert_bot_config"
  ON bot_config FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_bot_config"
  ON bot_config FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_delete_bot_config"
  ON bot_config FOR DELETE TO authenticated
  USING (public.is_admin());

-- ──────────────────────────────────────────────
-- 11. Admin policies — CONTENT (full CRUD)
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_all_content"
  ON content FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_insert_content"
  ON content FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_content"
  ON content FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_delete_content"
  ON content FOR DELETE TO authenticated
  USING (public.is_admin());

-- ──────────────────────────────────────────────
-- 12. Admin policies — ADMIN_USERS (read only)
-- ──────────────────────────────────────────────
CREATE POLICY "admin_select_admin_users"
  ON admin_users FOR SELECT TO authenticated
  USING (public.is_admin());
