-- ============================================================
-- 004_bookings_funnel.sql
-- Сквозная воронка bookings: lead → confirmed → completed
-- Таблица coupons, функция validate_coupon, триггер completion
-- ============================================================
-- Готов для выполнения в Supabase SQL Editor одним блоком.
-- ============================================================

BEGIN;

-- ════════════════════════════════════════════════
-- 1. ALTER TABLE bookings — изменить существующие колонки
-- ════════════════════════════════════════════════

-- 1a. user_id: сделать nullable (FK остаётся на users(id))
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- Пересоздать FK с ON DELETE SET NULL
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
ALTER TABLE bookings
  ADD CONSTRAINT bookings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 1b. clinic_id: сделать nullable (FK остаётся на clinics(id))
ALTER TABLE bookings ALTER COLUMN clinic_id DROP NOT NULL;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_clinic_id_fkey;
ALTER TABLE bookings
  ADD CONSTRAINT bookings_clinic_id_fkey
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL;

-- 1c. status: мигрировать 'pending' → 'lead', поменять default, добавить CHECK
UPDATE bookings SET status = 'lead' WHERE status = 'pending';

ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'lead';

ALTER TABLE bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('lead', 'confirmed', 'completed', 'no_show', 'cancelled'));

-- 1d. updated_at: добавить default NOW() (был без default)
ALTER TABLE bookings ALTER COLUMN updated_at SET DEFAULT now();

-- ════════════════════════════════════════════════
-- 2. ALTER TABLE bookings — добавить новые колонки
-- ════════════════════════════════════════════════

-- Кто
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS email TEXT;

-- Атрибуция
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source_page TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Что
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS clinic_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scan_type TEXT NOT NULL DEFAULT 'primary';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS desired_time TEXT;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_scan_type_check
  CHECK (scan_type IN ('primary', 'repeat'));

-- Оффер
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_value_rub INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_variant TEXT;

-- Воронка (timestamps)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Повторы
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS repeat_of_booking_id UUID
  REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS repeat_reminder_sent BOOLEAN DEFAULT false;

-- Мета
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lead_type TEXT DEFAULT 'booking';

-- ════════════════════════════════════════════════
-- 3. Backfill + enforce NOT NULL (staged migration)
-- ════════════════════════════════════════════════
-- Заполняем пустые значения для существующих строк (если есть)
UPDATE bookings SET session_id = 'legacy_' || id::text WHERE session_id IS NULL;
UPDATE bookings SET name = '' WHERE name IS NULL;
UPDATE bookings SET phone = '' WHERE phone IS NULL;

-- Теперь безопасно ставить NOT NULL
ALTER TABLE bookings ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN name SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN phone SET NOT NULL;

-- ════════════════════════════════════════════════
-- 4. Индексы
-- ════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_bookings_session  ON bookings (session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status   ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_clinic   ON bookings (clinic_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created  ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_user     ON bookings (user_id) WHERE user_id IS NOT NULL;

-- ════════════════════════════════════════════════
-- 5. RLS-политики для bookings (дополняют существующие admin SELECT/UPDATE)
-- ════════════════════════════════════════════════

-- Админ: полный CRUD (добавляем INSERT и DELETE к существующим SELECT/UPDATE)
CREATE POLICY "admin_insert_bookings"
  ON bookings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_bookings"
  ON bookings FOR DELETE TO authenticated
  USING (public.is_admin());

-- Пользователь: видит свои записи
CREATE POLICY "user_select_own_bookings"
  ON bookings FOR SELECT TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Анонимный: может создавать запись (форма на лендинге)
CREATE POLICY "anon_insert_bookings"
  ON bookings FOR INSERT TO anon
  WITH CHECK (true);

-- Авторизованный: тоже может создавать запись
CREATE POLICY "auth_insert_bookings"
  ON bookings FOR INSERT TO authenticated
  WITH CHECK (true);

-- ════════════════════════════════════════════════
-- 6. Таблица coupons
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS coupons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,
  value_rub    INTEGER NOT NULL,
  variant      TEXT NOT NULL,
  valid_from   TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until  TIMESTAMPTZ,
  max_uses     INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Админ: полный CRUD
CREATE POLICY "admin_select_coupons"
  ON coupons FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_insert_coupons"
  ON coupons FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_coupons"
  ON coupons FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_delete_coupons"
  ON coupons FOR DELETE TO authenticated
  USING (public.is_admin());

-- Анонимный и авторизованный: могут читать активные купоны (для валидации на клиенте)
CREATE POLICY "anon_select_active_coupons"
  ON coupons FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "auth_select_active_coupons"
  ON coupons FOR SELECT TO authenticated
  USING (is_active = true);

-- ════════════════════════════════════════════════
-- 7. Тестовый купон
-- ════════════════════════════════════════════════
INSERT INTO coupons (code, value_rub, variant, valid_until, max_uses)
VALUES ('BODY500', 500, 'bonus_500', now() + INTERVAL '90 days', 1000)
ON CONFLICT (code) DO NOTHING;

-- ════════════════════════════════════════════════
-- 8. Функция validate_coupon
-- ════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT)
RETURNS TABLE(valid BOOLEAN, value_rub INTEGER, variant TEXT, reason TEXT)
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
  v_coupon RECORD;
BEGIN
  SELECT c.* INTO v_coupon
  FROM coupons c
  WHERE UPPER(c.code) = UPPER(p_code);

  -- Купон не найден
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, ''::TEXT, 'Купон не найден'::TEXT;
    RETURN;
  END IF;

  -- Не активен
  IF NOT v_coupon.is_active THEN
    RETURN QUERY SELECT false, 0, ''::TEXT, 'Купон деактивирован'::TEXT;
    RETURN;
  END IF;

  -- Ещё не начал действовать
  IF now() < v_coupon.valid_from THEN
    RETURN QUERY SELECT false, 0, ''::TEXT, 'Купон ещё не активен'::TEXT;
    RETURN;
  END IF;

  -- Истёк
  IF v_coupon.valid_until IS NOT NULL AND now() > v_coupon.valid_until THEN
    RETURN QUERY SELECT false, 0, ''::TEXT, 'Срок действия купона истёк'::TEXT;
    RETURN;
  END IF;

  -- Лимит использований
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, 0, ''::TEXT, 'Лимит использований исчерпан'::TEXT;
    RETURN;
  END IF;

  -- Валиден
  RETURN QUERY SELECT true, v_coupon.value_rub, v_coupon.variant, 'OK'::TEXT;
END;
$$;

-- ════════════════════════════════════════════════
-- 9. Триггер: при status = 'completed' → заполнить completed_at, updated_at
-- ════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.booking_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();

  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.completed_at := now();
  END IF;

  IF NEW.status = 'confirmed' AND (OLD.status IS DISTINCT FROM 'confirmed') THEN
    NEW.confirmed_at := now();
  END IF;

  IF NEW.status = 'cancelled' AND (OLD.status IS DISTINCT FROM 'cancelled') THEN
    NEW.cancelled_at := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_status_change
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.booking_on_status_change();

COMMIT;
