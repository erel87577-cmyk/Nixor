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
