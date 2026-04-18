import { z } from "zod";

export const importStatusSchema = z.enum(["draft", "full", "partial", "link_only"]);

export const assetKindSchema = z.enum([
  "character-card-png",
  "character-card-json",
  "worldbook",
  "quick-reply",
  "image",
  "other-file",
]);

export const createPostInputSchema = z.object({
  sourceUrl: z.string().url().nullable().optional(),
  sourceType: z.string().trim().nullable().optional(),
  title: z.string().trim().min(1),
  body: z.string().default(""),
  authorName: z.string().trim().default(""),
  tags: z.array(z.string().trim()).default([]),
  sourceTags: z.array(z.string().trim()).default([]),
  userTags: z.array(z.string().trim()).default([]),
  notes: z.string().default(""),
  importStatus: importStatusSchema.default("draft"),
});

export const createAssetInputSchema = z.object({
  postId: z.string().min(1),
  kind: assetKindSchema,
  displayName: z.string().trim().optional(),
  authorNameOverride: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim()).default([]),
  originalFilename: z.string().trim().min(1),
  storageKey: z.string().trim().nullable().optional(),
  previewKey: z.string().trim().nullable().optional(),
  mimeType: z.string().trim().nullable().optional(),
  fileSize: z.number().int().nonnegative().nullable().optional(),
  checksum: z.string().trim().nullable().optional(),
  characterName: z.string().trim().nullable().optional(),
  openingMessage: z.string().nullable().optional(),
  descriptionSummary: z.string().nullable().optional(),
  rawParsedMetadata: z.record(z.string(), z.unknown()).default({}),
  parseStatus: z.string().trim().default("pending"),
  parseWarnings: z.array(z.string()).default([]),
});

export const updateAssetMetadataSchema = z.object({
  assetId: z.string().min(1),
  authorNameOverride: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim()).default([]),
});

export const updatePostMetadataSchema = z.object({
  postId: z.string().min(1),
  authorName: z.string().trim().default(""),
  userTags: z.array(z.string().trim()).default([]),
  notes: z.string().default(""),
});

export type CreatePostInput = z.input<typeof createPostInputSchema>;
export type CreateAssetInput = z.input<typeof createAssetInputSchema>;
export type UpdateAssetMetadataInput = z.input<typeof updateAssetMetadataSchema>;
export type UpdatePostMetadataInput = z.input<typeof updatePostMetadataSchema>;
