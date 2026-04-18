import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  createAssetInputSchema,
  updateAssetMetadataSchema,
  type CreateAssetInput,
  type UpdateAssetMetadataInput,
} from "@/shared/contracts";
import type { AssetRecord } from "@/shared/domain";
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
    rawParsedMetadata:
      typeof row.raw_parsed_metadata_json === "string" ? JSON.parse(row.raw_parsed_metadata_json) : {},
    parseStatus: String(row.parse_status ?? "pending"),
    parseWarnings: parseJsonArray(row.parse_warnings_json),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function createAssetService(db: DatabaseClient) {
  async function getAssetById(assetId: string): Promise<AssetRecord | null> {
    const row = db.get<Record<string, unknown>>(`SELECT * FROM assets WHERE id = ?`, [assetId]);
    return row ? mapAssetRow(row) : null;
  }

  async function createAsset(input: CreateAssetInput): Promise<AssetRecord> {
    const parsed = createAssetInputSchema.parse(input);
    const postExists = db.get<{ id: string }>(`SELECT id FROM posts WHERE id = ?`, [parsed.postId]);

    if (!postExists) {
      throw new Error(`Cannot create asset: post ${parsed.postId} does not exist.`);
    }

    const id = `asset_${randomUUID()}`;
    const timestamp = nowIso();
    const displayName =
      parsed.displayName && parsed.displayName.length > 0
        ? parsed.displayName
        : path.parse(parsed.originalFilename).name;

    db.run(
      `INSERT INTO assets (
        id, post_id, kind, display_name, author_name_override, tags_json, original_filename,
        original_extension, storage_key, preview_key, mime_type, file_size, checksum,
        character_name, opening_message, description_summary, raw_parsed_metadata_json,
        parse_status, parse_warnings_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        parsed.postId,
        parsed.kind,
        displayName,
        parsed.authorNameOverride ?? null,
        JSON.stringify(parsed.tags),
        parsed.originalFilename,
        path.extname(parsed.originalFilename),
        parsed.storageKey ?? null,
        parsed.previewKey ?? null,
        parsed.mimeType ?? null,
        parsed.fileSize ?? null,
        parsed.checksum ?? null,
        parsed.characterName ?? null,
        parsed.openingMessage ?? null,
        parsed.descriptionSummary ?? null,
        JSON.stringify(parsed.rawParsedMetadata),
        parsed.parseStatus,
        JSON.stringify(parsed.parseWarnings),
        timestamp,
        timestamp,
      ],
    );

    const row = db.get<Record<string, unknown>>(`SELECT * FROM assets WHERE id = ?`, [id]);
    if (!row) {
      throw new Error("Failed to create asset.");
    }

    return mapAssetRow(row);
  }

  return {
    createAsset,

    getAssetById,

    async updateAssetMetadata(input: UpdateAssetMetadataInput): Promise<AssetRecord> {
      const parsed = updateAssetMetadataSchema.parse(input);
      const current = await getAssetById(parsed.assetId);

      if (!current) {
        throw new Error(`Cannot update asset: asset ${parsed.assetId} does not exist.`);
      }

      const timestamp = nowIso();
      db.run(
        `UPDATE assets
         SET author_name_override = ?, tags_json = ?, updated_at = ?
         WHERE id = ?`,
        [
          parsed.authorNameOverride ?? null,
          JSON.stringify(parsed.tags),
          timestamp,
          parsed.assetId,
        ],
      );

      const updated = await getAssetById(parsed.assetId);
      if (!updated) {
        throw new Error("Failed to reload asset after update.");
      }

      return updated;
    },
  };
}
