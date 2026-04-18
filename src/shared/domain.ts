export type ImportStatus = "draft" | "full" | "partial" | "link_only";

export type AssetKind =
  | "character-card-png"
  | "character-card-json"
  | "worldbook"
  | "quick-reply"
  | "image"
  | "other-file";

export interface SourcePostRecord {
  id: string;
  sourceUrl: string | null;
  sourceType: string | null;
  title: string;
  body: string;
  coverImageAssetId: string | null;
  authorName: string;
  sourceTags: string[];
  userTags: string[];
  tags: string[];
  notes: string;
  importStatus: ImportStatus;
  importedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetRecord {
  id: string;
  postId: string;
  kind: AssetKind;
  displayName: string;
  authorNameOverride: string | null;
  tags: string[];
  originalFilename: string;
  originalExtension: string;
  storageKey: string | null;
  previewKey: string | null;
  mimeType: string | null;
  fileSize: number | null;
  checksum: string | null;
  characterName: string | null;
  openingMessage: string | null;
  descriptionSummary: string | null;
  rawParsedMetadata: Record<string, unknown>;
  parseStatus: string;
  parseWarnings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostDetail {
  post: SourcePostRecord;
  assets: AssetRecord[];
}
