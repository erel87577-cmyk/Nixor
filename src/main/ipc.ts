import { ipcMain } from "electron";

export interface NixorIpcDeps {
  listPosts: () => Promise<unknown> | unknown;
  createDraftPost: (input: { sourceUrl: string }) => Promise<unknown> | unknown;
}

export function registerIpcHandlers(deps: NixorIpcDeps) {
  ipcMain.handle("posts:list", () => deps.listPosts());
  ipcMain.handle("posts:create-draft", (_event, input: { sourceUrl: string }) =>
    deps.createDraftPost(input),
  );
}
