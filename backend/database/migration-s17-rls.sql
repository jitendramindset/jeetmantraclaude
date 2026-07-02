-- =============================================================================
-- Migration S17: Row-Level Security (RLS) for JeetMantra EduOS
-- =============================================================================
-- Auth model: JWT tokens; user_id exposed via SET LOCAL app.current_user_id.
-- NOTE: Self-hosted Supabase uses service_role key which bypasses RLS.
-- These policies apply when using the anon key or when bypass is not active.
-- =============================================================================

-- Helper: get current user ID from app settings
CREATE OR REPLACE FUNCTION current_user_id() RETURNS text AS $$
  SELECT current_setting('app.current_user_id', true)::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS text AS $$
  SELECT current_setting('app.current_user_role', true)::text;
$$ LANGUAGE sql STABLE;

-- Enable RLS on highest-priority tables
ALTER TABLE IF EXISTS enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS studio_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jeetmantra_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jeetmantra_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- ENROLLMENTS: Students see only their own; teachers/admins/partners see all
DROP POLICY IF EXISTS enrollments_own ON enrollments;
CREATE POLICY enrollments_own ON enrollments
  FOR ALL USING (
    student_id = current_user_id()
    OR current_user_role() IN ('admin', 'super_admin', 'teacher', 'partner')
  );

-- CERTIFICATES: Users see only their own; admins see all; issuers see what they issued
DROP POLICY IF EXISTS certs_own ON certificates;
CREATE POLICY certs_own ON certificates
  FOR SELECT USING (
    user_id = current_user_id()
    OR current_user_role() IN ('admin', 'super_admin')
    OR issued_by = current_user_id()
  );

DROP POLICY IF EXISTS certs_admin_write ON certificates;
CREATE POLICY certs_admin_write ON certificates
  FOR INSERT WITH CHECK (current_user_role() IN ('admin', 'super_admin', 'teacher'));

-- STUDY STREAKS: Own only
DROP POLICY IF EXISTS streaks_own ON study_streaks;
CREATE POLICY streaks_own ON study_streaks
  FOR ALL USING (user_id = current_user_id());

-- USER XP LEDGER: Own only; admins see all
DROP POLICY IF EXISTS xp_own ON user_xp_ledger;
CREATE POLICY xp_own ON user_xp_ledger
  FOR SELECT USING (user_id = current_user_id() OR current_user_role() IN ('admin','super_admin'));

-- USER BADGES: Own only; admins see all
DROP POLICY IF EXISTS badges_own ON user_badges;
CREATE POLICY badges_own ON user_badges
  FOR SELECT USING (user_id = current_user_id() OR current_user_role() IN ('admin','super_admin'));

-- IMPERSONATION SESSIONS: Admin only
DROP POLICY IF EXISTS impersonation_admin ON impersonation_sessions;
CREATE POLICY impersonation_admin ON impersonation_sessions
  FOR ALL USING (current_user_role() IN ('admin', 'super_admin'));

-- STUDIO SCENES: Owner only; admins see all
DROP POLICY IF EXISTS studio_own ON studio_scenes;
CREATE POLICY studio_own ON studio_scenes
  FOR ALL USING (
    user_id = current_user_id()
    OR current_user_role() IN ('admin', 'super_admin')
  );

-- WALLETS: Owner read-only; no direct client writes
DROP POLICY IF EXISTS wallet_own ON jeetmantra_wallets;
CREATE POLICY wallet_own ON jeetmantra_wallets
  FOR SELECT USING (user_id = current_user_id() OR current_user_role() IN ('admin','super_admin'));

-- WALLET TRANSACTIONS: Owner read-only; admins see all
DROP POLICY IF EXISTS wallet_tx_own ON jeetmantra_wallet_transactions;
CREATE POLICY wallet_tx_own ON jeetmantra_wallet_transactions
  FOR SELECT USING (user_id = current_user_id() OR current_user_role() IN ('admin','super_admin'));

-- Document the architecture
COMMENT ON FUNCTION current_user_id() IS 'Returns the current user ID set via SET LOCAL app.current_user_id before queries';
COMMENT ON FUNCTION current_user_role() IS 'Returns the current user role set via SET LOCAL app.current_user_role before queries';
