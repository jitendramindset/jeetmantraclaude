-- migration-s19-external-results.sql
-- Student external exam results (board exams, competitive tests, etc.)

CREATE TABLE IF NOT EXISTS student_external_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       TEXT NOT NULL,
  exam_name        TEXT NOT NULL,
  score            NUMERIC(6,2),
  max_score        NUMERIC(6,2),
  grade            TEXT,
  result_date      DATE,
  certificate_url  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ser_student ON student_external_results(student_id);
CREATE INDEX IF NOT EXISTS idx_ser_exam    ON student_external_results(exam_name);
