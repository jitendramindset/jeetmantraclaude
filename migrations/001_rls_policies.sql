-- ============================================================
-- 001_rls_policies.sql
-- Row-Level Security for all public tables.
--
-- IMPORTANT: The backend uses SERVICE_ROLE_KEY which BYPASSES
-- RLS automatically — these policies only protect against:
--   • accidental anon-key exposure in client code
--   • direct Supabase Dashboard row browsing by non-admins
--   • future client-side SDK usage
--
-- Run via: POST /pg/query  with apikey header (service role).
-- Or paste directly in Supabase Dashboard → SQL editor.
-- ============================================================

-- ── Helper: one-liner to enable RLS + deny anon by default ─────────────────
-- Enabling RLS with no permissive policy = implicit DENY for anon/authenticated.
-- Service role always bypasses regardless.

-- ── Core user table ─────────────────────────────────────────────────────────
ALTER TABLE jeetmantra_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_service_role" ON jeetmantra_users;
CREATE POLICY "users_service_role" ON jeetmantra_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Courses ─────────────────────────────────────────────────────────────────
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_service_role" ON courses;
CREATE POLICY "courses_service_role" ON courses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Enrollments ─────────────────────────────────────────────────────────────
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "enrollments_service_role" ON enrollments;
CREATE POLICY "enrollments_service_role" ON enrollments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Payments ─────────────────────────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_service_role" ON payments;
CREATE POLICY "payments_service_role" ON payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Course content ──────────────────────────────────────────────────────────
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "course_content_service_role" ON course_content;
CREATE POLICY "course_content_service_role" ON course_content
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Live classes ────────────────────────────────────────────────────────────
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "live_classes_service_role" ON live_classes;
CREATE POLICY "live_classes_service_role" ON live_classes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Attendance ──────────────────────────────────────────────────────────────
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_service_role" ON attendance;
CREATE POLICY "attendance_service_role" ON attendance
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Marketplace listings ────────────────────────────────────────────────────
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "marketplace_listings_service_role" ON marketplace_listings;
CREATE POLICY "marketplace_listings_service_role" ON marketplace_listings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Platform settings (admin-only — strictest) ──────────────────────────────
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_settings_service_role" ON platform_settings;
CREATE POLICY "platform_settings_service_role" ON platform_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Audit log ────────────────────────────────────────────────────────────────
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_log_service_role" ON audit_log;
CREATE POLICY "audit_log_service_role" ON audit_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Notifications ───────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_service_role" ON notifications;
CREATE POLICY "notifications_service_role" ON notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Wallet transactions ──────────────────────────────────────────────────────
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wallet_transactions_service_role" ON wallet_transactions;
CREATE POLICY "wallet_transactions_service_role" ON wallet_transactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Wallets ──────────────────────────────────────────────────────────────────
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wallets_service_role" ON wallets;
CREATE POLICY "wallets_service_role" ON wallets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Certificates ─────────────────────────────────────────────────────────────
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "certificates_service_role" ON certificates;
CREATE POLICY "certificates_service_role" ON certificates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Assignments + submissions ────────────────────────────────────────────────
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assignments_service_role" ON assignments;
CREATE POLICY "assignments_service_role" ON assignments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assignment_submissions_service_role" ON assignment_submissions;
CREATE POLICY "assignment_submissions_service_role" ON assignment_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Gamification ─────────────────────────────────────────────────────────────
ALTER TABLE gamification_events  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gamification_events_service_role"  ON gamification_events;
CREATE POLICY "gamification_events_service_role"  ON gamification_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE gamification_badges  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gamification_badges_service_role"  ON gamification_badges;
CREATE POLICY "gamification_badges_service_role"  ON gamification_badges
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE gamification_user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gamification_user_badges_service_role" ON gamification_user_badges;
CREATE POLICY "gamification_user_badges_service_role" ON gamification_user_badges
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE gamification_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gamification_streaks_service_role" ON gamification_streaks;
CREATE POLICY "gamification_streaks_service_role" ON gamification_streaks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE gamification_leaderboard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gamification_leaderboard_service_role" ON gamification_leaderboard;
CREATE POLICY "gamification_leaderboard_service_role" ON gamification_leaderboard
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Orgs + memberships ───────────────────────────────────────────────────────
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orgs_service_role" ON orgs;
CREATE POLICY "orgs_service_role" ON orgs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_memberships_service_role" ON org_memberships;
CREATE POLICY "org_memberships_service_role" ON org_memberships
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Bookings + resources ─────────────────────────────────────────────────────
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bookings_service_role" ON bookings;
CREATE POLICY "bookings_service_role" ON bookings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "resources_service_role" ON resources;
CREATE POLICY "resources_service_role" ON resources
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Support tickets ──────────────────────────────────────────────────────────
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "support_tickets_service_role" ON support_tickets;
CREATE POLICY "support_tickets_service_role" ON support_tickets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "support_messages_service_role" ON support_messages;
CREATE POLICY "support_messages_service_role" ON support_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Chat ─────────────────────────────────────────────────────────────────────
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_messages_service_role" ON chat_messages;
CREATE POLICY "chat_messages_service_role" ON chat_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_rooms_service_role" ON chat_rooms;
CREATE POLICY "chat_rooms_service_role" ON chat_rooms
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Timetable ────────────────────────────────────────────────────────────────
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "timetable_slots_service_role" ON timetable_slots;
CREATE POLICY "timetable_slots_service_role" ON timetable_slots
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Coupons + referrals ──────────────────────────────────────────────────────
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coupons_service_role" ON coupons;
CREATE POLICY "coupons_service_role" ON coupons
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coupon_usages_service_role" ON coupon_usages;
CREATE POLICY "coupon_usages_service_role" ON coupon_usages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Approvals + payouts + reports ────────────────────────────────────────────
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "approvals_service_role" ON approvals;
CREATE POLICY "approvals_service_role" ON approvals
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payouts_service_role" ON payouts;
CREATE POLICY "payouts_service_role" ON payouts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Translations ─────────────────────────────────────────────────────────────
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "translations_service_role" ON translations;
CREATE POLICY "translations_service_role" ON translations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── User roles (multi-role junction) ────────────────────────────────────────
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_service_role" ON user_roles;
CREATE POLICY "user_roles_service_role" ON user_roles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Verify: list tables with RLS enabled ─────────────────────────────────────
-- Run this after applying the migration to confirm:
--
-- SELECT tablename, rowsecurity
-- FROM   pg_tables
-- WHERE  schemaname = 'public'
-- ORDER  BY tablename;
--
-- Every table should show rowsecurity = true.
-- ─────────────────────────────────────────────────────────────────────────────
