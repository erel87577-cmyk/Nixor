import { createHash } from "node:crypto";
import fs from "node:fs";
import nodeFs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { AssetStore } from "@/main/services/asset-store";
import { ExportService } from "@/main/services/export-service";
import { PreviewStore } from "@/main/services/preview-store";

function sha256(filePath: string) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

describe("asset preservation", () => {
  const tempRoots: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempRoots.splice(0).map(async (root) => {
        await nodeFs.rm(root, { recursive: true, force: true });
      }),
    );
  });

  it("exports the exact original PNG bytes", async () => {
    const samplePath = path.resolve("test/fixtures/sample-card.png");
    const tempRoot = await nodeFs.mkdtemp(path.join(os.tmpdir(), "nixor-preserve-"));
    tempRoots.push(tempRoot);

    const store = new AssetStore(path.join(tempRoot, "originals"));
    const exportService = new ExportService();
    const imported = await store.importFile(samplePath, "sample-card.png");
    const exportedPath = path.join(tempRoot, "exports", "sample-card.png");

    await exportService.copyOriginal(imported.storagePath, exportedPath);

    expect(sha256(imported.storagePath)).toBe(sha256(samplePath));
    expect(sha256(exportedPath)).toBe(sha256(samplePath));
  });

  it("writes previews into a separate derivative directory", async () => {
    const samplePath = path.resolve("test/fixtures/sample-card.png");
    const tempRoot = await nodeFs.mkdtemp(path.join(os.tmpdir(), "nixor-preview-"));
    tempRoots.push(tempRoot);

    const store = new AssetStore(path.join(tempRoot, "originals"));
    const previewStore = new PreviewStore(path.join(tempRoot, "previews"));
    const imported = await store.importFile(samplePath, "sample-card.png");
    const previewPath = await previewStore.createImagePreview(imported.storagePath, "sample-card-preview");

    expect(previewPath).not.toBe(imported.storagePath);
    expect(previewPath).toContain(`${path.sep}previews${path.sep}`);
    expect(imported.storagePath).toContain(`${path.sep}originals${path.sep}`);
    expect(await nodeFs.readFile(previewPath)).toEqual(await nodeFs.readFile(imported.storagePath));
  });
});
