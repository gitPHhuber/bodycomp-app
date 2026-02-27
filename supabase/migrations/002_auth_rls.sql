-- ============================================================
-- 002_auth_rls.sql
-- Phase 1: Auth integration — link users to Supabase Auth,
--          session binding, RLS for authenticated users
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. Link custom users table to Supabase Auth
-- ──────────────────────────────────────────────
ALTER TABLE users ADD COLUMN auth_id UUID UNIQUE REFERENCES auth.users(id);
CREATE INDEX idx_users_auth_id ON users (auth_id);

-- ──────────────────────────────────────────────
-- 2. Trigger: auto-create/link user on signup
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to link existing user by email
  UPDATE public.users
    SET auth_id = NEW.id, last_seen_at = now()
    WHERE email = NEW.email AND auth_id IS NULL;

  -- If no existing user found, create new one
  IF NOT FOUND THEN
    INSERT INTO public.users (email, auth_id, source, last_seen_at)
    VALUES (NEW.email, NEW.id, 'website', now());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────
-- 3. RPC: bind anonymous session data to user
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.bind_session_to_user(p_session_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM public.users WHERE auth_id = auth.uid();
  IF v_user_id IS NULL THEN RETURN; END IF;

  UPDATE public.events
    SET user_id = v_user_id
    WHERE session_id = p_session_id AND user_id IS NULL;

  UPDATE public.calc_results
    SET user_id = v_user_id
    WHERE session_id = p_session_id AND user_id IS NULL;

  UPDATE public.quiz_results
    SET user_id = v_user_id
    WHERE session_id = p_session_id AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────
-- 4. RLS policies for authenticated users
-- ──────────────────────────────────────────────

-- Users: read/update own row
CREATE POLICY "auth_select_own_user"
  ON users FOR SELECT TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "auth_update_own_user"
  ON users FOR UPDATE TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Calc results: read own, insert
CREATE POLICY "auth_select_own_calc_results"
  ON calc_results FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "auth_insert_calc_results"
  ON calc_results FOR INSERT TO authenticated
  WITH CHECK (true);

-- Events: insert for authenticated
CREATE POLICY "auth_insert_events"
  ON events FOR INSERT TO authenticated
  WITH CHECK (true);

-- Quiz results: read own, insert
CREATE POLICY "auth_select_own_quiz_results"
  ON quiz_results FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "auth_insert_quiz_results"
  ON quiz_results FOR INSERT TO authenticated
  WITH CHECK (true);
