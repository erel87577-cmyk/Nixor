import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseCharacterCard } from "@/main/parsers/character-card";

describe("character parser", () => {
  it("extracts character name and greeting from JSON cards", async () => {
    const filePath = path.resolve("test/fixtures/sample-card.json");
    const bytes = fs.readFileSync(filePath);

    const parsed = await parseCharacterCard(bytes, "sample-card.json", "application/json");

    expect(parsed.parseStatus).toBe("parsed");
    expect(parsed.characterName).toBe("Rin");
    expect(parsed.openingMessage).toContain("Welcome back");
    expect(parsed.descriptionSummary).toContain("quiet archivist");
  });

  it("returns unsupported for unhandled formats without crashing", async () => {
    const bytes = fs.readFileSync(path.resolve("test/fixtures/sample-card.png"));

    const parsed = await parseCharacterCard(bytes, "sample-card.png", "image/png");

    expect(parsed.parseStatus).toBe("unsupported");
    expect(parsed.parseWarnings[0]).toMatch(/supported parser/i);
  });
});
