import { randomUUID } from "node:crypto";

import { createPostInputSchema, type CreatePostInput } from "@/shared/contracts";
import type { AssetRecord, PostDetail, SourcePostRecord } from "@/shared/domain";
import type { DatabaseClient } from "@/main/db/client";

function nowIso() {
  return new Date().toISOString();
}

function parseJsonArray(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function mapPostRow(row: Record<string, unknown>): SourcePostRecord {
  return {
    id: String(row.id),
    sourceUrl: row.source_url ? String(row.source_url) : null,
    sourceType: row.source_type ? String(row.source_type) : null,
    title: String(row.title),
    body: String(row.body ?? ""),
    coverImageAssetId: row.cover_image_asset_id ? String(row.cover_image_asset_id) : null,
    authorName: String(row.author_name ?? ""),
    tags: parseJsonArray(row.tags_json),
    notes: String(row.notes ?? ""),
    importStatus: String(row.import_status) as SourcePostRecord["importStatus"],
    importedAt: String(row.imported_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapAssetRow(row: Record<string, unknown>): AssetRecord {
  return {
    id: String(row.id),
    postId: String(row.post_id),
    kind: String(row.kind) as AssetRecord["kind"],
    displayName: String(row.display_name),
    authorNameOverride: row.author_name_override ? String(row.author_name_override) : null,
    tags: parseJsonArray(row.tags_json),
    originalFilename: String(row.original_filename),
    originalExtension: String(row.original_extension ?? ""),
    storageKey: row.storage_key ? String(row.storage_key) : null,
    previewKey: row.preview_key ? String(row.preview_key) : null,
    mimeType: row.mime_type ? String(row.mime_type) : null,
    fileSize: typeof row.file_size === "number" ? row.file_size : row.file_size == null ? null : Number(row.file_size),
    checksum: row.checksum ? String(row.checksum) : null,
    characterName: row.character_name ? String(row.character_name) : null,
    openingMessage: row.opening_message ? String(row.opening_message) : null,
    descriptionSummary: row.description_summary ? String(row.description_summary) : null,
    rawParsedMetadata: typeof row.raw_parsed_metadata_json === "string" ? JSON.parse(row.raw_parsed_metadata_json) : {},
    parseStatus: String(row.parse_status ?? "pending"),
    parseWarnings: parseJsonArray(row.parse_warnings_json),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function createPostService(db: DatabaseClient) {
  async function createPost(input: CreatePostInput): Promise<SourcePostRecord> {
    const parsed = createPostInputSchema.parse(input);
    const id = `post_${randomUUID()}`;
    const timestamp = nowIso();

    db.run(
      `INSERT INTO posts (
        id, source_url, source_type, title, body, cover_image_asset_id, author_name,
        tags_json, notes, import_status, imported_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        parsed.sourceUrl ?? null,
        parsed.sourceType ?? null,
        parsed.title,
        parsed.body,
        null,
        parsed.authorName,
        JSON.stringify(parsed.tags),
        parsed.notes,
        parsed.importStatus,
        timestamp,
        timestamp,
        timestamp,
      ],
    );

    const row = db.get<Record<string, unknown>>(`SELECT * FROM posts WHERE id = ?`, [id]);
    if (!row) {
      throw new Error("Failed to create post.");
    }

    return mapPostRow(row);
  }

  return {
    createPost,

    async createDraft(input: { sourceUrl: string }): Promise<SourcePostRecord> {
      return createPost({
        sourceUrl: input.sourceUrl,
        title: "Untitled import",
        body: "",
        authorName: "",
        importStatus: "link_only",
      });
    },

    async listPosts(): Promise<Array<SourcePostRecord & { summary: string }>> {
      const rows = db.all<Record<string, unknown>>(
        `SELECT * FROM posts ORDER BY imported_at DESC, created_at DESC`,
      );

      return rows.map((row) => {
        const post = mapPostRow(row);
        return {
          ...post,
          summary: post.body ? post.body.slice(0, 160) : post.sourceUrl ?? "",
        };
      });
    },

    async getPostDetail(postId: string): Promise<PostDetail | null> {
      const postRow = db.get<Record<string, unknown>>(`SELECT * FROM posts WHERE id = ?`, [postId]);
      if (!postRow) {
        return null;
      }

      const assetRows = db.all<Record<string, unknown>>(
        `SELECT * FROM assets WHERE post_id = ? ORDER BY created_at ASC, id ASC`,
        [postId],
      );

      return {
        post: mapPostRow(postRow),
        assets: assetRows.map(mapAssetRow),
      };
    },
  };
}
