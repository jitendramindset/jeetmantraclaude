-- Migration S18: Add missing indexes for query performance
-- Run after migration-s14-cms.sql and all prior migrations.

-- CMS indexes
CREATE INDEX IF NOT EXISTS idx_cms_posts_org ON cms_posts(org_id);
CREATE INDEX IF NOT EXISTS idx_cms_posts_author ON cms_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_cms_posts_status_org ON cms_posts(org_id, status);
CREATE INDEX IF NOT EXISTS idx_cms_media_org ON cms_media(org_id);
CREATE INDEX IF NOT EXISTS idx_cms_media_uploader ON cms_media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_cms_comments_author ON cms_comments(author_id);

-- Studio indexes
CREATE INDEX IF NOT EXISTS idx_studio_scenes_course ON studio_scenes(course_id);

-- Certificate indexes
CREATE INDEX IF NOT EXISTS idx_certs_template ON certificates(template_id);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_v2_payment ON bookings_v2(payment_id);

-- Timetable indexes
CREATE INDEX IF NOT EXISTS idx_tt_slots_teacher ON timetable_slots(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tt_templates_course ON timetable_templates(course_id);

-- Approval indexes
CREATE INDEX IF NOT EXISTS idx_approvals_applicant ON approval_requests(applicant_id);
CREATE INDEX IF NOT EXISTS idx_approvals_decided ON approval_requests(decided_by);

-- Payout indexes
CREATE INDEX IF NOT EXISTS idx_payouts_approved_by ON payouts(approved_by);

-- Marketplace indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_course ON marketplace_listings(course_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer ON marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_listing ON marketplace_purchases(listing_id);

-- Sync queue index (critical for offline-first poll performance)
CREATE INDEX IF NOT EXISTS idx_sync_queue_unsynced ON sync_queue(synced_at) WHERE synced_at IS NULL;

-- AI session indexes
CREATE INDEX IF NOT EXISTS idx_ai_sessions_course ON ai_chat_sessions(course_id);
