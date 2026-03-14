-- ============================================================
-- 005_user_consents.sql
-- Add consent tracking columns to users table
-- ============================================================

ALTER TABLE users ADD COLUMN consent_personal_data    BOOLEAN     DEFAULT false;
ALTER TABLE users ADD COLUMN consent_personal_data_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN consent_marketing        BOOLEAN     DEFAULT false;
ALTER TABLE users ADD COLUMN consent_marketing_at     TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN consent_health_data      BOOLEAN     DEFAULT false;
ALTER TABLE users ADD COLUMN consent_health_data_at   TIMESTAMPTZ;
