export const schemaSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  source_url TEXT,
  source_type TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  cover_image_asset_id TEXT,
  author_name TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  source_tags_json TEXT NOT NULL DEFAULT '[]',
  user_tags_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  import_status TEXT NOT NULL DEFAULT 'draft',
  imported_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  display_name TEXT NOT NULL,
  author_name_override TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  original_filename TEXT NOT NULL,
  original_extension TEXT NOT NULL DEFAULT '',
  storage_key TEXT,
  preview_key TEXT,
  mime_type TEXT,
  file_size INTEGER,
  checksum TEXT,
  character_name TEXT,
  opening_message TEXT,
  description_summary TEXT,
  raw_parsed_metadata_json TEXT NOT NULL DEFAULT '{}',
  parse_status TEXT NOT NULL DEFAULT 'pending',
  parse_warnings_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assets_post_id ON assets(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_name ON posts(author_name);
CREATE INDEX IF NOT EXISTS idx_assets_kind ON assets(kind);
`;
