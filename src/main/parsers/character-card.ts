import path from "node:path";

export interface ParsedCharacterCard {
  parseStatus: "parsed" | "unsupported" | "failed";
  characterName: string;
  openingMessage: string;
  descriptionSummary: string;
  rawParsedMetadata: Record<string, unknown>;
  parseWarnings: string[];
}

function summarize(value: unknown) {
  return typeof value === "string" ? value.slice(0, 200) : "";
}

export async function parseCharacterCard(
  bytes: Buffer,
  fileName: string,
  mimeType?: string,
): Promise<ParsedCharacterCard> {
  const lowerName = fileName.toLowerCase();
  const extension = path.extname(lowerName);

  if (mimeType === "application/json" || extension === ".json") {
    try {
      const parsed = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
      return {
        parseStatus: "parsed",
        characterName: typeof parsed.name === "string" ? parsed.name : "",
        openingMessage: typeof parsed.first_mes === "string" ? parsed.first_mes : "",
        descriptionSummary: summarize(parsed.description),
        rawParsedMetadata: parsed,
        parseWarnings: [],
      };
    } catch (error) {
      return {
        parseStatus: "failed",
        characterName: "",
        openingMessage: "",
        descriptionSummary: "",
        rawParsedMetadata: {},
        parseWarnings: [
          error instanceof Error ? error.message : "Failed to parse character card JSON.",
        ],
      };
    }
  }

  return {
    parseStatus: "unsupported",
    characterName: "",
    openingMessage: "",
    descriptionSummary: "",
    rawParsedMetadata: {},
    parseWarnings: ["No supported parser for this file type yet."],
  };
}
