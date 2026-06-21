-- ============================================================================
-- Sprint 3 migration — Operations queues (approvals, payouts, support, reports,
-- notifications).
--
-- Idempotent: every statement guards with IF NOT EXISTS / DROP-then-ADD.
-- Apply via Supabase /pg/query (no runner script — operator applies).
-- Style mirrors migration-s2-identity.sql.
-- ============================================================================

-- ── (S3-1) approval_requests — unified approvals queue (teacher onboarding,
-- course publish, payout, KYC). target_id refers to the row being approved
-- (e.g. course id, payout id). applicant_id = the user who submitted.
CREATE TABLE IF NOT EXISTS approval_requests (
  id           varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type         varchar NOT NULL,
  target_id    varchar,
  applicant_id varchar,
  status       varchar NOT NULL DEFAULT 'pending',
  reason       text,
  decided_by   varchar,
  decided_at   timestamptz,
  metadata     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE approval_requests
  DROP CONSTRAINT IF EXISTS approval_requests_type_check;
ALTER TABLE approval_requests
  ADD CONSTRAINT approval_requests_type_check
  CHECK (type IN ('teacher','course','payout','kyc'));

ALTER TABLE approval_requests
  DROP CONSTRAINT IF EXISTS approval_requests_status_check;
ALTER TABLE approval_requests
  ADD CONSTRAINT approval_requests_status_check
  CHECK (status IN ('pending','approved','rejected'));

CREATE INDEX IF NOT EXISTS idx_approval_requests_status_type
  ON approval_requests(status, type);

-- ── (S3-2) payouts — payee = creator/seller requesting a payout. Lifecycle:
-- pending → approved → paid (or rejected). gateway_ref captures bank/UPI ref.
CREATE TABLE IF NOT EXISTS payouts (
  id            varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  payee_id      varchar NOT NULL,
  amount        numeric NOT NULL,
  currency      varchar NOT NULL DEFAULT 'INR',
  status        varchar NOT NULL DEFAULT 'pending',
  requested_at  timestamptz NOT NULL DEFAULT now(),
  approved_by   varchar,
  approved_at   timestamptz,
  paid_at       timestamptz,
  gateway_ref   varchar,
  notes         text
);

ALTER TABLE payouts
  DROP CONSTRAINT IF EXISTS payouts_status_check;
ALTER TABLE payouts
  ADD CONSTRAINT payouts_status_check
  CHECK (status IN ('pending','approved','paid','rejected'));

CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_payee  ON payouts(payee_id);

-- ── (S3-3) support_tickets — internal helpdesk. tenant_id optional (used when
-- ticket originates from an institution context).
CREATE TABLE IF NOT EXISTS support_tickets (
  id           varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  requester_id varchar NOT NULL,
  tenant_id    varchar,
  subject      text,
  body         text,
  status       varchar NOT NULL DEFAULT 'open',
  priority     varchar NOT NULL DEFAULT 'normal',
  assignee_id  varchar,
  sla_due_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_status_check;
ALTER TABLE support_tickets
  ADD CONSTRAINT support_tickets_status_check
  CHECK (status IN ('open','pending','resolved','closed'));

ALTER TABLE support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_priority_check;
ALTER TABLE support_tickets
  ADD CONSTRAINT support_tickets_priority_check
  CHECK (priority IN ('low','normal','high','urgent'));

CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority
  ON support_tickets(status, priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_requester
  ON support_tickets(requester_id);

-- ── (S3-4) support_ticket_messages — thread of messages on a ticket.
-- is_internal = staff-only note, not shown to requester.
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id   varchar NOT NULL,
  sender_id   varchar NOT NULL,
  body        text,
  is_internal boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket
  ON support_ticket_messages(ticket_id);

-- ── (S3-5) content_reports — user-flagged content awaiting moderation.
CREATE TABLE IF NOT EXISTS content_reports (
  id          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  target_type varchar NOT NULL,
  target_id   varchar,
  reporter_id varchar,
  reason      text,
  status      varchar NOT NULL DEFAULT 'pending',
  decided_by  varchar,
  decided_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE content_reports
  DROP CONSTRAINT IF EXISTS content_reports_target_type_check;
ALTER TABLE content_reports
  ADD CONSTRAINT content_reports_target_type_check
  CHECK (target_type IN ('course','message','review','user','recording','listing'));

ALTER TABLE content_reports
  DROP CONSTRAINT IF EXISTS content_reports_status_check;
ALTER TABLE content_reports
  ADD CONSTRAINT content_reports_status_check
  CHECK (status IN ('pending','dismissed','actioned'));

CREATE INDEX IF NOT EXISTS idx_content_reports_status_target
  ON content_reports(status, target_type);

-- ── (S3-6) notification_templates — versioned templates per (key, channel,
-- locale). Updating a template increments version (handled in route layer).
CREATE TABLE IF NOT EXISTS notification_templates (
  id         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key        varchar NOT NULL,
  channel    varchar NOT NULL DEFAULT 'in_app',
  locale     varchar NOT NULL DEFAULT 'en',
  subject    text,
  body       text,
  version    int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_templates_key_channel_locale
  ON notification_templates(key, channel, locale);

-- ── (S3-7) notification_log — every queued/sent notification. Actual delivery
-- is fulfilled by the n8n addon; we record intent + final state here.
CREATE TABLE IF NOT EXISTS notification_log (
  id           varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  recipient_id varchar,
  template_key varchar,
  channel      varchar,
  status       varchar NOT NULL DEFAULT 'queued',
  sent_at      timestamptz,
  payload      jsonb
);

ALTER TABLE notification_log
  DROP CONSTRAINT IF EXISTS notification_log_channel_check;
ALTER TABLE notification_log
  ADD CONSTRAINT notification_log_channel_check
  CHECK (channel IN ('in_app','email','sms','push'));

ALTER TABLE notification_log
  DROP CONSTRAINT IF EXISTS notification_log_status_check;
ALTER TABLE notification_log
  ADD CONSTRAINT notification_log_status_check
  CHECK (status IN ('queued','sent','failed'));

CREATE INDEX IF NOT EXISTS idx_notification_log_recipient_sent
  ON notification_log(recipient_id, sent_at);

NOTIFY pgrst, 'reload schema';
