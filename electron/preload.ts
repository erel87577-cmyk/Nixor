import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("nixor", {
  listPosts: () => ipcRenderer.invoke("posts:list"),
  createDraftPost: (input: { sourceUrl: string }) => ipcRenderer.invoke("posts:create-draft", input),
});
