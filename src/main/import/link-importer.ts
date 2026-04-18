import { parseSourceHtml } from "./html-parser";

export interface LinkImportInput {
  sourceUrl: string;
  html: string;
}

export interface LinkImportResult {
  sourceUrl: string;
  title: string;
  body: string;
  imageUrls: string[];
  importStatus: "full" | "partial" | "link_only";
}

export class LinkImporter {
  async importFromHtml(input: LinkImportInput): Promise<LinkImportResult> {
    const parsed = parseSourceHtml(input.html);

    const hasUsefulTitle = parsed.title !== "Untitled import";
    const hasUsefulBody = parsed.body.length >= 40;
    const hasImages = parsed.imageUrls.length > 0;

    let importStatus: LinkImportResult["importStatus"] = "link_only";
    if ((hasUsefulTitle || hasUsefulBody) && hasImages) {
      importStatus = "full";
    } else if (hasUsefulTitle || hasUsefulBody || hasImages) {
      importStatus = "partial";
    }

    return {
      sourceUrl: input.sourceUrl,
      title: parsed.title,
      body: parsed.body,
      imageUrls: parsed.imageUrls,
      importStatus,
    };
  }
}
