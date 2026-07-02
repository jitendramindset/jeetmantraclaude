-- S14: Website CMS — posts, blogs, events, pages, media, comments
-- Admin manages website content like WordPress: rich-text posts, events, media library, comments moderation.

-- ── Content types ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_posts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type            VARCHAR     NOT NULL DEFAULT 'post',  -- 'post'|'blog'|'event'|'page'|'announcement'
  title           VARCHAR     NOT NULL,
  slug            VARCHAR     UNIQUE,
  excerpt         TEXT,
  body            TEXT,                -- HTML / rich text
  cover_image     VARCHAR,             -- URL
  status          VARCHAR     NOT NULL DEFAULT 'draft', -- 'draft'|'published'|'archived'
  featured        BOOLEAN     DEFAULT false,
  tags            JSONB       DEFAULT '[]',
  meta            JSONB       DEFAULT '{}',  -- SEO: og_title, og_desc, og_image, keywords
  author_id       VARCHAR     REFERENCES jeetmantra_users(id) ON DELETE SET NULL,
  org_id          UUID,
  -- Event-specific
  event_start     TIMESTAMPTZ,
  event_end       TIMESTAMPTZ,
  event_location  VARCHAR,
  event_url       VARCHAR,
  event_capacity  INT,
  -- References
  post_references JSONB       DEFAULT '[]',  -- [{label, url}]
  attachments     JSONB       DEFAULT '[]',  -- [{name, url, type}]
  -- Engagement
  views           INT         DEFAULT 0,
  likes           INT         DEFAULT 0,
  allow_comments  BOOLEAN     DEFAULT true,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_posts_type_idx   ON cms_posts(type, status);
CREATE INDEX IF NOT EXISTS cms_posts_slug_idx   ON cms_posts(slug);
CREATE INDEX IF NOT EXISTS cms_posts_author_idx ON cms_posts(author_id);
CREATE INDEX IF NOT EXISTS cms_posts_event_idx  ON cms_posts(event_start) WHERE type='event';

-- ── Media library ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_media (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  filename    VARCHAR NOT NULL,
  original_name VARCHAR,
  url         VARCHAR NOT NULL,
  mime_type   VARCHAR,
  size_bytes  INT,
  width       INT,
  height      INT,
  alt_text    VARCHAR,
  caption     VARCHAR,
  folder      VARCHAR DEFAULT 'general',
  uploaded_by VARCHAR REFERENCES jeetmantra_users(id) ON DELETE SET NULL,
  org_id      UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_media_folder_idx ON cms_media(folder, created_at DESC);

-- ── Comments ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_comments (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID    NOT NULL REFERENCES cms_posts(id) ON DELETE CASCADE,
  parent_id   UUID    REFERENCES cms_comments(id) ON DELETE CASCADE,  -- nested replies
  author_id   VARCHAR REFERENCES jeetmantra_users(id) ON DELETE SET NULL,
  author_name VARCHAR,   -- for anonymous/guest comments
  author_email VARCHAR,
  body        TEXT    NOT NULL,
  status      VARCHAR NOT NULL DEFAULT 'approved',  -- 'pending'|'approved'|'spam'|'trash'
  likes       INT     DEFAULT 0,
  ip_address  VARCHAR,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_comments_post_idx   ON cms_comments(post_id, status, created_at);
CREATE INDEX IF NOT EXISTS cms_comments_parent_idx ON cms_comments(parent_id);

-- ── Categories ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_categories (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR NOT NULL,
  slug        VARCHAR UNIQUE,
  description TEXT,
  parent_id   UUID    REFERENCES cms_categories(id),
  post_type   VARCHAR DEFAULT 'blog',  -- which post type this category belongs to
  org_id      UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- post ↔ category join
CREATE TABLE IF NOT EXISTS cms_post_categories (
  post_id     UUID NOT NULL REFERENCES cms_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES cms_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- ── Website pages / static content ───────────────────────────────────────────
-- (Handled via cms_posts with type='page'. No extra table needed.)

-- ── Seed default categories ───────────────────────────────────────────────────
INSERT INTO cms_categories (name, slug, post_type) VALUES
  ('General',       'general',       'blog'),
  ('Announcements', 'announcements', 'blog'),
  ('Events',        'events',        'event'),
  ('Tutorials',     'tutorials',     'blog'),
  ('News',          'news',          'blog')
ON CONFLICT (slug) DO NOTHING;
