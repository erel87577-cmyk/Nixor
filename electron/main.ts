import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, dialog } from "electron";
import { registerIpcHandlers } from "../src/main/ipc";
import { createDatabaseClient } from "../src/main/db/client";
import { createPostService } from "../src/main/services/post-service";
import { resolveAppPaths } from "../src/main/services/paths";
import { createAssetService } from "../src/main/services/asset-service";
import { AssetStore } from "../src/main/services/asset-store";
import { FileImporter } from "../src/main/import/file-importer";
import { ExportService } from "../src/main/services/export-service";
import { LinkImporter } from "../src/main/import/link-importer";

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
  const assets = createAssetService(db);
  const assetStore = new AssetStore(paths.originalsDir);
  const fileImporter = new FileImporter(assetStore);
  const exportService = new ExportService();
  const linkImporter = new LinkImporter();

  registerIpcHandlers({
    listPosts: () => posts.listPosts(),
    createDraftPost: ({ sourceUrl }) => posts.createDraft({ sourceUrl }),
    importSourceLink: async ({ sourceUrl }) => {
      try {
        const response = await fetch(sourceUrl, {
          signal: AbortSignal.timeout(6000),
          headers: {
            "user-agent": "Nixor/0.1",
          },
        });

        if (!response.ok) {
          throw new Error(`Unexpected status ${response.status}`);
        }

        const html = await response.text();
        const imported = await linkImporter.importFromHtml({ sourceUrl, html });

        return posts.createPost({
          sourceUrl: imported.sourceUrl,
          title: imported.title,
          body: imported.body,
          sourceTags: imported.sourceTags,
          importStatus: imported.importStatus,
        });
      } catch {
        return posts.createDraft({ sourceUrl });
      }
    },
    getPostDetail: ({ postId }) => posts.getPostDetail(postId),
    updatePostMetadata: (input) => posts.updatePostMetadata(input),
    getAssetDetail: ({ assetId }) => assets.getAssetById(assetId),
    importAssetToPost: async ({ postId }) => {
      const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
      const result = await dialog.showOpenDialog(window, {
        title: "Import asset into source post",
        properties: ["openFile"],
        filters: [
          { name: "Supported assets", extensions: ["png", "json", "jpg", "jpeg", "webp"] },
          { name: "All files", extensions: ["*"] },
        ],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      const filePath = result.filePaths[0];
      const imported = await fileImporter.importLocalFile(filePath);
      const lowerName = imported.originalFilename.toLowerCase();
      const kind =
        imported.originalExtension === ".png"
          ? "character-card-png"
          : imported.originalExtension === ".json"
            ? "character-card-json"
            : lowerName.includes("world")
              ? "worldbook"
              : "other-file";

      return assets.createAsset({
        postId,
        kind,
        originalFilename: imported.originalFilename,
        storageKey: imported.storagePath,
        mimeType: imported.originalExtension === ".png" ? "image/png" : "application/json",
        fileSize: imported.fileSize,
        checksum: imported.checksum,
        characterName: imported.characterName,
        openingMessage: imported.openingMessage,
        descriptionSummary: imported.descriptionSummary,
        rawParsedMetadata: imported.rawParsedMetadata,
        parseStatus: imported.parseStatus,
        parseWarnings: imported.parseWarnings,
      });
    },
    updateAssetMetadata: (input) => assets.updateAssetMetadata(input),
    exportAsset: async ({ assetId }) => {
      const asset = await assets.getAssetById(assetId);
      if (!asset?.storageKey) {
        return { success: false };
      }

      const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
      const saveResult = await dialog.showSaveDialog(window, {
        title: "Export original asset",
        defaultPath: asset.originalFilename,
      });

      if (saveResult.canceled || !saveResult.filePath) {
        return { success: false };
      }

      await exportService.copyOriginal(asset.storageKey, saveResult.filePath);
      return { success: true };
    },
    getAssetPreview: async ({ assetId }) => {
      const asset = await assets.getAssetById(assetId);
      if (!asset?.storageKey) {
        return { kind: "empty" } as const;
      }

      if (asset.mimeType?.startsWith("image/")) {
        return {
          kind: "image" as const,
          dataUrl: await assetStore.readAsDataUrl(asset.storageKey, asset.mimeType),
        };
      }

      if (asset.mimeType === "application/json" || asset.originalExtension === ".json") {
        const fs = await import("node:fs/promises");
        const content = await fs.readFile(asset.storageKey, "utf8");
        return {
          kind: "text" as const,
          content: content.slice(0, 4000),
        };
      }

      return { kind: "empty" } as const;
    },
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
