-- ============================================================================
-- Sprint 5 (audit's Sprint 4) migration — Student Success Platform.
-- Streak / XP / Badges / Notifications: the gamification spine.
-- Idempotent. Apply via /pg/query (same pattern as prior migrations).
-- ============================================================================

-- ── (SS-1.1) study_streaks — one row per user. Daily check-in resets the
-- counter if a day was missed.
CREATE TABLE IF NOT EXISTS study_streaks (
  user_id         varchar PRIMARY KEY,
  current_streak  int     NOT NULL DEFAULT 0,
  longest_streak  int     NOT NULL DEFAULT 0,
  last_checkin    date,                                   -- the calendar date of the latest qualifying activity
  total_days      int     NOT NULL DEFAULT 0,             -- lifetime count of distinct days active
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_streaks_last_checkin ON study_streaks(last_checkin);

-- ── (SS-1.2) user_xp_ledger — append-only XP log. The current XP balance is
-- SUM(xp) by user; level is computed by code (e.g. 100 XP per level).
CREATE TABLE IF NOT EXISTS user_xp_ledger (
  id          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     varchar NOT NULL,
  event_type  varchar NOT NULL,            -- assignment_submitted, test_passed, etc.
  xp          int     NOT NULL,            -- positive = earn, negative = adjust
  ref_table   varchar,                     -- best-effort source pointer for auditability
  ref_id      varchar,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_user_time     ON user_xp_ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_event_type    ON user_xp_ledger(event_type);

-- ── (SS-1.3) badges — the catalog. Seeded with 10 starters below.
CREATE TABLE IF NOT EXISTS badges (
  id          varchar PRIMARY KEY,         -- short slug (first_class, week_streak_7, etc.)
  title       varchar NOT NULL,
  description text,
  icon        varchar,                     -- emoji or icon ref
  category    varchar,                     -- onboarding / consistency / mastery / social
  criteria    jsonb NOT NULL,              -- JSON rule the award pipeline evaluates
  xp_reward   int   DEFAULT 0,
  active      boolean DEFAULT TRUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── (SS-1.4) user_badges — earned badges.
CREATE TABLE IF NOT EXISTS user_badges (
  id          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     varchar NOT NULL,
  badge_id    varchar NOT NULL,
  earned_at   timestamptz NOT NULL DEFAULT now(),
  metadata    jsonb,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id, earned_at DESC);

-- ── (SS-1.5) notifications — dedicated user notifications, separate from the
-- activity feed (which is shared across courses). Audit recommended this.
CREATE TABLE IF NOT EXISTS notifications (
  id          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     varchar NOT NULL,
  type        varchar NOT NULL,            -- badge_earned / class_starting / assignment_due / xp_milestone / ...
  title       varchar NOT NULL,
  body        text,
  link        varchar,                     -- where to deep-link the user
  icon        varchar,
  is_read     boolean NOT NULL DEFAULT FALSE,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_user_time   ON notifications(user_id, created_at DESC);

-- ── Seed 10 starter badges. ON CONFLICT keeps re-runs idempotent.
INSERT INTO badges (id, title, description, icon, category, criteria, xp_reward) VALUES
  ('first_steps',     'First Steps',       'Joined your first course.',                    '🎒', 'onboarding',  '{"event":"course_enrolled","count":1}'::jsonb,             20),
  ('first_class',     'First Class',       'Attended your first live class.',              '🎓', 'onboarding',  '{"event":"live_joined","count":1}'::jsonb,                 30),
  ('homework_hero',   'Homework Hero',     'Submitted your first assignment.',             '📝', 'onboarding',  '{"event":"assignment_submitted","count":1}'::jsonb,        40),
  ('test_taker',      'Test Taker',        'Completed your first test.',                   '🧪', 'onboarding',  '{"event":"test_completed","count":1}'::jsonb,              50),
  ('week_streak_7',   'Week Warrior',      '7-day learning streak.',                       '🔥', 'consistency', '{"event":"streak","threshold":7}'::jsonb,                  70),
  ('streak_30',       'Monthly Master',    '30-day learning streak.',                      '🏆', 'consistency', '{"event":"streak","threshold":30}'::jsonb,                200),
  ('streak_100',      'Centurion',         '100-day learning streak.',                     '👑', 'consistency', '{"event":"streak","threshold":100}'::jsonb,               500),
  ('course_complete', 'Course Champion',   'Completed an entire course.',                  '🏅', 'mastery',     '{"event":"course_completed","count":1}'::jsonb,           150),
  ('curious_mind',    'Curious Mind',      'Asked the AI tutor 10 questions.',             '🤖', 'mastery',     '{"event":"ai_question","count":10}'::jsonb,                60),
  ('polyglot',        'Polyglot',          'Switched the reader to a different language.', '🌐', 'social',      '{"event":"language_switched","count":1}'::jsonb,           25)
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
