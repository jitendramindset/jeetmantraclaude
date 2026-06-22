-- 002_indexes.sql — performance indexes for high-traffic columns.
-- Run via Admin → System → "Run migration" or Supabase SQL Editor.
-- All CREATE INDEX use IF NOT EXISTS — safe to re-run.

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_teacher        ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_institution    ON courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_courses_status         ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category       ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_created        ON courses(created_at DESC);

-- Enrollments (most-joined table)
CREATE INDEX IF NOT EXISTS idx_enrollments_user       ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course     ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status     ON enrollments(status);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_user          ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course        ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status        ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created       ON payments(created_at DESC);

-- Notifications (user inbox query)
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created  ON notifications(created_at DESC);

-- Audit log (admin dashboard + forensics)
CREATE INDEX IF NOT EXISTS idx_audit_log_actor        ON audit_log(actor_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action       ON audit_log(action);

-- Live classes
CREATE INDEX IF NOT EXISTS idx_live_classes_course    ON live_classes(course_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_teacher   ON live_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_start     ON live_classes(start_time);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_class       ON attendance(live_class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user        ON attendance(user_id);

-- Chat (room timeline)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room     ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participants ON chat_rooms USING gin(participants);

-- Wallet
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user         ON wallet_transactions(user_id, created_at DESC);

-- Certificates
CREATE INDEX IF NOT EXISTS idx_certificates_user      ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course    ON certificates(course_id);

-- Gamification
CREATE INDEX IF NOT EXISTS idx_gami_events_user       ON gamification_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gami_points_user       ON gamification_points(user_id);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_booker        ON bookings(booker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_resource      ON bookings(resource_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start         ON bookings(start_time);

-- Support
CREATE INDEX IF NOT EXISTS idx_support_tickets_user   ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- Orgs / memberships
CREATE INDEX IF NOT EXISTS idx_orgs_owner             ON orgs(owner_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_user   ON org_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_org    ON org_memberships(org_id);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email            ON jeetmantra_users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone            ON jeetmantra_users(phone);
CREATE INDEX IF NOT EXISTS idx_users_type             ON jeetmantra_users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_google_id        ON jeetmantra_users(google_id) WHERE google_id IS NOT NULL;

-- OTP (cleanup + lookup)
CREATE INDEX IF NOT EXISTS idx_otps_phone             ON otps(phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otps_email             ON otps(email, created_at DESC);

-- Marketplace
CREATE INDEX IF NOT EXISTS idx_marketplace_seller     ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status     ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_category   ON marketplace_listings(category);

-- Assignments
CREATE INDEX IF NOT EXISTS idx_assignments_course     ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignment_sub_user    ON assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_sub_assign  ON assignment_submissions(assignment_id);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user     ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon   ON coupon_usages(coupon_id);

-- Timetable
CREATE INDEX IF NOT EXISTS idx_timetable_slots_org    ON timetable_slots(org_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_day    ON timetable_slots(day_of_week);
