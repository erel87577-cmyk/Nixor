import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("nixor", {
  listPosts: () => ipcRenderer.invoke("posts:list"),
  createDraftPost: (input: { sourceUrl: string }) => ipcRenderer.invoke("posts:create-draft", input),
  importSourceLink: (input: { sourceUrl: string }) => ipcRenderer.invoke("posts:import-link", input),
  getPostDetail: (input: { postId: string }) => ipcRenderer.invoke("posts:get-detail", input),
  updatePostMetadata: (input: { postId: string; authorName: string; userTags: string[]; notes: string }) =>
    ipcRenderer.invoke("posts:update-metadata", input),
  getAssetDetail: (input: { assetId: string }) => ipcRenderer.invoke("assets:get-detail", input),
  importAssetToPost: (input: { postId: string }) => ipcRenderer.invoke("assets:import-to-post", input),
  updateAssetMetadata: (input: { assetId: string; authorNameOverride?: string | null; tags: string[] }) =>
    ipcRenderer.invoke("assets:update-metadata", input),
  exportAsset: (input: { assetId: string }) => ipcRenderer.invoke("assets:export", input),
  getAssetPreview: (input: { assetId: string }) => ipcRenderer.invoke("assets:get-preview", input),
});
