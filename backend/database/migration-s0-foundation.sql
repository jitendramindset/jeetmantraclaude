-- migration-s0-foundation.sql
-- Foundation tables referenced by later sprint migrations (s2, s7, s10, etc.)
-- Must run before any other sprint migration.

-- 1. institution_teachers (referenced by s2, s7)
CREATE TABLE IF NOT EXISTS institution_teachers (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  institution_id varchar NOT NULL,
  user_id varchar NOT NULL,
  role varchar NOT NULL DEFAULT 'teacher',
  status varchar NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','pending')),
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(institution_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_inst_teachers_inst ON institution_teachers(institution_id);
CREATE INDEX IF NOT EXISTS idx_inst_teachers_user ON institution_teachers(user_id);

-- 2. institution_students (referenced by s7)
CREATE TABLE IF NOT EXISTS institution_students (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  institution_id varchar NOT NULL,
  user_id varchar NOT NULL,
  status varchar NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  enrolled_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(institution_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_inst_students_inst ON institution_students(institution_id);
CREATE INDEX IF NOT EXISTS idx_inst_students_user ON institution_students(user_id);

-- 3. course_batches (referenced by s10)
CREATE TABLE IF NOT EXISTS course_batches (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id varchar NOT NULL,
  name varchar NOT NULL,
  start_date date,
  end_date date,
  max_students int DEFAULT 30,
  status varchar NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','completed','draft')),
  capacity int DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_batches_course ON course_batches(course_id);

-- 4. chat_rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name varchar,
  type varchar NOT NULL DEFAULT 'direct' CHECK (type IN ('direct','group','course','support')),
  course_id varchar,
  created_by varchar NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_course ON chat_rooms(course_id);

-- 5. chat_room_members (referenced by s2)
CREATE TABLE IF NOT EXISTS chat_room_members (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id varchar NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id varchar NOT NULL,
  role varchar DEFAULT 'member' CHECK (role IN ('member','admin','owner')),
  last_read_at timestamptz,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_chat_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_room_members(user_id);

-- 6. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id varchar NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id varchar NOT NULL,
  content text NOT NULL,
  message_type varchar DEFAULT 'text' CHECK (message_type IN ('text','image','file','system')),
  reply_to_id varchar,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
