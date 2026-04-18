import type { AssetRecord, PostDetail } from "@/shared/domain";

export interface LibraryListItem {
  id: string;
  title: string;
  authorName: string;
  tags: string[];
  summary?: string;
  sourceUrl?: string | null;
}

export interface RendererApi {
  listPosts(): Promise<LibraryListItem[]>;
  createDraftPost(input: { sourceUrl: string }): Promise<LibraryListItem>;
  importSourceLink(input: { sourceUrl: string }): Promise<LibraryListItem>;
  getPostDetail(input: { postId: string }): Promise<PostDetail | null>;
  updatePostMetadata(input: {
    postId: string;
    authorName: string;
    userTags: string[];
    notes: string;
  }): Promise<PostDetail["post"] | null>;
  getAssetDetail(input: { assetId: string }): Promise<AssetRecord | null>;
  importAssetToPost(input: { postId: string }): Promise<AssetRecord | null>;
  updateAssetMetadata(input: {
    assetId: string;
    authorNameOverride?: string | null;
    tags: string[];
  }): Promise<AssetRecord | null>;
  exportAsset(input: { assetId: string }): Promise<{ success: boolean }>;
  getAssetPreview(input: { assetId: string }): Promise<
    | { kind: "image"; dataUrl: string }
    | { kind: "text"; content: string }
    | { kind: "empty" }
  >;
}

const fallbackItems: LibraryListItem[] = [
  {
    id: "post-001",
    title: "Evening archive drop",
    authorName: "Unknown author",
    tags: ["draft", "character", "png"],
    summary: "Quiet placeholder shell for the first library view.",
  },
  {
    id: "post-002",
    title: "Imported source thread",
    authorName: "Manual author",
    tags: ["link", "author"],
    summary: "Task 5 exposes browsing surfaces while the full IPC story is still being wired.",
  },
];

export const fallbackApi: RendererApi = {
  async listPosts() {
    return [...fallbackItems];
  },
  async createDraftPost(input: { sourceUrl: string }) {
    const created: LibraryListItem = {
      id: `post-${Date.now()}`,
      title: "Untitled import",
      authorName: "",
      tags: [],
      summary: input.sourceUrl,
      sourceUrl: input.sourceUrl,
    };

    fallbackItems.unshift(created);
    return created;
  },
  async importSourceLink(input: { sourceUrl: string }) {
    return this.createDraftPost(input);
  },
  async getPostDetail(input: { postId: string }) {
    const found = fallbackItems.find((item) => item.id === input.postId);
    if (!found) return null;
    return {
      post: {
        id: found.id,
        sourceUrl: found.sourceUrl ?? found.summary ?? null,
        sourceType: null,
        title: found.title,
        body: found.summary ?? "",
        coverImageAssetId: null,
        authorName: found.authorName,
        sourceTags: [],
        userTags: found.tags,
        tags: found.tags,
        notes: "",
        importStatus: "draft",
        importedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      assets: [],
    };
  },
  async updatePostMetadata(input) {
    const found = fallbackItems.find((item) => item.id === input.postId);
    if (!found) return null;
    found.authorName = input.authorName;
    found.tags = input.userTags;
    return {
      id: found.id,
      sourceUrl: found.sourceUrl ?? found.summary ?? null,
      sourceType: null,
      title: found.title,
      body: found.summary ?? "",
      coverImageAssetId: null,
      authorName: found.authorName,
      sourceTags: [],
      userTags: found.tags,
      tags: found.tags,
      notes: input.notes,
      importStatus: "draft",
      importedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  async getAssetDetail() {
    return null;
  },
  async importAssetToPost() {
    return null;
  },
  async updateAssetMetadata() {
    return null;
  },
  async exportAsset() {
    return { success: false };
  },
  async getAssetPreview() {
    return { kind: "empty" } as const;
  },
};

export function getRendererApi(): RendererApi {
  if (typeof window !== "undefined" && window.nixor) {
    return window.nixor;
  }

  return fallbackApi;
}

declare global {
  interface Window {
    nixor?: RendererApi;
  }
}
