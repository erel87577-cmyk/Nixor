import fs from "node:fs/promises";
import path from "node:path";

export class ExportService {
  async copyOriginal(storagePath: string, destinationPath: string): Promise<void> {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(storagePath, destinationPath);
  }
}
