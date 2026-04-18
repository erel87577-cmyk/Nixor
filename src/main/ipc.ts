import { ipcMain } from "electron";

export interface NixorIpcDeps {
  listPosts: () => Promise<unknown> | unknown;
  createDraftPost: (input: { sourceUrl: string }) => Promise<unknown> | unknown;
  importSourceLink: (input: { sourceUrl: string }) => Promise<unknown> | unknown;
  getPostDetail: (input: { postId: string }) => Promise<unknown> | unknown;
  updatePostMetadata: (input: {
    postId: string;
    authorName: string;
    userTags: string[];
    notes: string;
  }) => Promise<unknown> | unknown;
  getAssetDetail: (input: { assetId: string }) => Promise<unknown> | unknown;
  importAssetToPost: (input: { postId: string }) => Promise<unknown> | unknown;
  updateAssetMetadata: (input: {
    assetId: string;
    authorNameOverride?: string | null;
    tags: string[];
  }) => Promise<unknown> | unknown;
  exportAsset: (input: { assetId: string }) => Promise<unknown> | unknown;
  getAssetPreview: (input: { assetId: string }) => Promise<unknown> | unknown;
}

export function registerIpcHandlers(deps: NixorIpcDeps) {
  ipcMain.handle("posts:list", () => deps.listPosts());
  ipcMain.handle("posts:create-draft", (_event, input: { sourceUrl: string }) =>
    deps.createDraftPost(input),
  );
  ipcMain.handle("posts:import-link", (_event, input: { sourceUrl: string }) =>
    deps.importSourceLink(input),
  );
  ipcMain.handle("posts:get-detail", (_event, input: { postId: string }) =>
    deps.getPostDetail(input),
  );
  ipcMain.handle(
    "posts:update-metadata",
    (_event, input: { postId: string; authorName: string; userTags: string[]; notes: string }) =>
      deps.updatePostMetadata(input),
  );
  ipcMain.handle("assets:get-detail", (_event, input: { assetId: string }) =>
    deps.getAssetDetail(input),
  );
  ipcMain.handle("assets:import-to-post", (_event, input: { postId: string }) =>
    deps.importAssetToPost(input),
  );
  ipcMain.handle(
    "assets:update-metadata",
    (_event, input: { assetId: string; authorNameOverride?: string | null; tags: string[] }) =>
      deps.updateAssetMetadata(input),
  );
  ipcMain.handle("assets:export", (_event, input: { assetId: string }) => deps.exportAsset(input));
  ipcMain.handle("assets:get-preview", (_event, input: { assetId: string }) =>
    deps.getAssetPreview(input),
  );
}
