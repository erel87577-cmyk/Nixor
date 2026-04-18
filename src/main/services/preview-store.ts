import fs from "node:fs/promises";
import path from "node:path";

export class PreviewStore {
  constructor(private readonly previewsDir: string) {}

  async createImagePreview(originalPath: string, previewName?: string): Promise<string> {
    await fs.mkdir(this.previewsDir, { recursive: true });

    const sourceExtension = path.extname(originalPath).toLowerCase() || ".bin";
    const targetFileName = `${previewName ?? path.parse(originalPath).name}${sourceExtension}`;
    const previewPath = path.join(this.previewsDir, targetFileName);

    await fs.copyFile(originalPath, previewPath);

    return previewPath;
  }
}
