import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export interface ImportedAssetFile {
  storagePath: string;
  checksum: string;
  fileSize: number;
  originalExtension: string;
  originalFilename: string;
}

export class AssetStore {
  constructor(private readonly originalsDir: string) {}

  async importFile(sourcePath: string, originalFilename?: string): Promise<ImportedAssetFile> {
    const bytes = await fs.readFile(sourcePath);
    const safeOriginalFilename = originalFilename ?? path.basename(sourcePath);
    const originalExtension = path.extname(safeOriginalFilename).toLowerCase();
    const checksum = createHash("sha256").update(bytes).digest("hex");
    const storageName = `${randomUUID()}${originalExtension}`;
    const storagePath = path.join(this.originalsDir, storageName);

    await fs.mkdir(this.originalsDir, { recursive: true });
    await fs.writeFile(storagePath, bytes);

    return {
      storagePath,
      checksum,
      fileSize: bytes.byteLength,
      originalExtension,
      originalFilename: safeOriginalFilename,
    };
  }

  async readAsDataUrl(storagePath: string, mimeType: string) {
    const bytes = await fs.readFile(storagePath);
    return `data:${mimeType};base64,${bytes.toString("base64")}`;
  }
}
