import type { DatabaseClient } from "./client";
import { schemaSql } from "./schema";

export function migrate(client: DatabaseClient) {
  client.exec(schemaSql);

  const postColumns = client.all<{ name: string }>(`PRAGMA table_info(posts)`);
  const columnNames = new Set(postColumns.map((column) => String(column.name)));

  if (!columnNames.has("source_tags_json")) {
    client.exec(`ALTER TABLE posts ADD COLUMN source_tags_json TEXT NOT NULL DEFAULT '[]'`);
  }

  if (!columnNames.has("user_tags_json")) {
    client.exec(`ALTER TABLE posts ADD COLUMN user_tags_json TEXT NOT NULL DEFAULT '[]'`);
    client.exec(`UPDATE posts SET user_tags_json = tags_json WHERE user_tags_json = '[]'`);
  }
}
