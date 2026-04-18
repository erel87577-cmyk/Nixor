import fs from "node:fs/promises";
import path from "node:path";

import { AssetStore } from "@/main/services/asset-store";
import { parseCharacterCard } from "@/main/parsers/character-card";

export interface FileImportResult {
  originalFilename: string;
  originalExtension: string;
  storagePath: string;
  checksum: string;
  fileSize: number;
  parseStatus: "parsed" | "unsupported" | "failed";
  characterName: string;
  openingMessage: string;
  descriptionSummary: string;
  rawParsedMetadata: Record<string, unknown>;
  parseWarnings: string[];
}

export class FileImporter {
  constructor(private readonly assetStore: AssetStore) {}

  async importLocalFile(sourcePath: string, mimeType?: string): Promise<FileImportResult> {
    const originalFilename = path.basename(sourcePath);
    const stored = await this.assetStore.importFile(sourcePath, originalFilename);
    const bytes = await fs.readFile(stored.storagePath);
    const parsed = await parseCharacterCard(bytes, originalFilename, mimeType);

    return {
      originalFilename: stored.originalFilename,
      originalExtension: stored.originalExtension,
      storagePath: stored.storagePath,
      checksum: stored.checksum,
      fileSize: stored.fileSize,
      parseStatus: parsed.parseStatus,
      characterName: parsed.characterName,
      openingMessage: parsed.openingMessage,
      descriptionSummary: parsed.descriptionSummary,
      rawParsedMetadata: parsed.rawParsedMetadata,
      parseWarnings: parsed.parseWarnings,
    };
  }
}
