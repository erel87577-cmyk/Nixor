import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow } from "electron";
import { registerIpcHandlers } from "../src/main/ipc";
import { createDatabaseClient } from "../src/main/db/client";
import { createPostService } from "../src/main/services/post-service";
import { resolveAppPaths } from "../src/main/services/paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    title: "Nixor",
    backgroundColor: "#f3f1ed",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rendererUrl = process.env.VITE_DEV_SERVER_URL;

  if (rendererUrl) {
    void window.loadURL(rendererUrl);
    window.webContents.openDevTools({ mode: "detach" });
    return;
  }

  void window.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(async () => {
  const paths = resolveAppPaths(app.getPath("userData"));
  const db = await createDatabaseClient({ filePath: paths.databaseFile });
  const posts = createPostService(db);

  registerIpcHandlers({
    listPosts: () => posts.listPosts(),
    createDraftPost: ({ sourceUrl }) => posts.createDraft({ sourceUrl }),
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
