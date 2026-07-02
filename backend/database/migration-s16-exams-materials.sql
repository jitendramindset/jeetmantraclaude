-- ============================================================================
-- Sprint 16 migration — Exams, Course Materials, AI Chat Sessions,
-- and Live Class Recordings.
-- Backs: exam-platform.js, Downloads screen, AI tutor, LiveRoster recordings.
-- Idempotent. Apply via /pg/query (same pattern as prior migrations).
-- ============================================================================

-- ── (S16-1) exams — one row per exam/quiz attached to a course.
CREATE TABLE IF NOT EXISTS exams (
  id                   varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id            varchar NOT NULL,
  title                varchar NOT NULL,
  description          text,
  instructions         text,
  time_limit_minutes   int,
  pass_percent         numeric(5,2) DEFAULT 60,
  max_attempts         int DEFAULT 3,
  shuffle_questions    boolean DEFAULT false,
  show_results         boolean DEFAULT true,
  status               varchar NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft','published','archived')),
  starts_at            timestamptz,
  ends_at              timestamptz,
  created_by           varchar NOT NULL,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course_id);

-- ── (S16-2) exam_questions — individual questions belonging to an exam.
-- options: array of choice strings (MCQ/multi_select).
-- correct_answer: single answer text (mcq/true_false/short).
-- correct_answers: array of correct answers (multi_select/essay rubric).
CREATE TABLE IF NOT EXISTS exam_questions (
  id               varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_id          varchar NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text    text NOT NULL,
  question_type    varchar NOT NULL DEFAULT 'mcq'
                     CHECK (question_type IN ('mcq','true_false','short','essay','multi_select')),
  options          jsonb,
  correct_answer   text,
  correct_answers  jsonb,
  explanation      text,
  points           numeric(6,2) DEFAULT 1,
  sort_order       int DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON exam_questions(exam_id, sort_order);

-- ── (S16-3) exam_attempts — one row per student attempt.
-- answers: map of question_id → student answer value.
CREATE TABLE IF NOT EXISTS exam_attempts (
  id                   varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_id              varchar NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id           varchar NOT NULL,
  attempt_number       int DEFAULT 1,
  answers              jsonb DEFAULT '{}',
  score                numeric(6,2),
  max_score            numeric(6,2),
  percentage           numeric(5,2),
  passed               boolean,
  time_taken_seconds   int,
  started_at           timestamptz DEFAULT now(),
  submitted_at         timestamptz,
  graded_at            timestamptz,
  graded_by            varchar,
  status               varchar DEFAULT 'in_progress'
                         CHECK (status IN ('in_progress','submitted','graded','abandoned')),
  created_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam    ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student ON exam_attempts(student_id, exam_id);

-- ── (S16-4) course_materials — downloadable / streamable files per course.
-- Backs the Downloads screen. module_id/lesson_id allow lesson-level scoping.
CREATE TABLE IF NOT EXISTS course_materials (
  id                varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id         varchar NOT NULL,
  module_id         varchar,
  lesson_id         varchar,
  title             varchar NOT NULL,
  description       text,
  file_url          text NOT NULL,
  file_type         varchar
                      CHECK (file_type IN ('pdf','video','audio','image','zip','doc','ppt','xls','other')),
  file_size_bytes   bigint,
  is_downloadable   boolean DEFAULT true,
  is_preview        boolean DEFAULT false,
  sort_order        int DEFAULT 0,
  uploaded_by       varchar NOT NULL,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_materials_course ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_lesson ON course_materials(lesson_id);

-- ── (S16-5) ai_chat_sessions — top-level AI tutor sessions.
-- context_summary holds a rolling summary for long conversations.
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id               varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id          varchar NOT NULL,
  course_id        varchar,
  lesson_id        varchar,
  session_type     varchar DEFAULT 'tutor'
                     CHECK (session_type IN ('tutor','exam_help','essay','general')),
  title            varchar,
  context_summary  text,
  total_messages   int DEFAULT 0,
  tokens_used      int DEFAULT 0,
  is_archived      boolean DEFAULT false,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_chat_sessions(user_id, created_at DESC);

-- ── (S16-6) ai_chat_messages — individual messages within a session.
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id           varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id   varchar NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role         varchar NOT NULL CHECK (role IN ('user','assistant','system')),
  content      text NOT NULL,
  tokens_used  int,
  model_used   varchar,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_session ON ai_chat_messages(session_id, created_at);

-- ── (S16-7) live_class_recordings — post-session recordings linked to a class.
-- class_id references the live_classes table (Sprint 3).
CREATE TABLE IF NOT EXISTS live_class_recordings (
  id                varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  class_id          varchar NOT NULL,
  course_id         varchar,
  title             varchar,
  recording_url     text NOT NULL,
  thumbnail_url     text,
  duration_seconds  int,
  file_size_bytes   bigint,
  is_published      boolean DEFAULT false,
  recorded_at       timestamptz DEFAULT now(),
  published_at      timestamptz,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recordings_class ON live_class_recordings(class_id);

NOTIFY pgrst, 'reload schema';
