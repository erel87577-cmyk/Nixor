import { afterEach, describe, expect, it } from "vitest";

import { createDatabaseClient } from "@/main/db/client";
import { createAssetService } from "@/main/services/asset-service";
import { createPostService } from "@/main/services/post-service";

describe("asset detail service", () => {
  const clients: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    await Promise.all(clients.splice(0).map((client) => client.close()));
  });

  it("loads an asset by id with parsed character fields", async () => {
    const db = await createDatabaseClient({ inMemory: true });
    clients.push(db);

    const posts = createPostService(db);
    const assets = createAssetService(db);

    const post = await posts.createDraft({ sourceUrl: "https://example.com/source/thread-7" });
    const created = await assets.createAsset({
      postId: post.id,
      kind: "character-card-json",
      originalFilename: "rin.json",
      storageKey: "data/originals/rin.json",
      characterName: "Rin",
      openingMessage: "Welcome back.",
      descriptionSummary: "Quiet archivist.",
      rawParsedMetadata: { name: "Rin" },
      parseStatus: "parsed",
      parseWarnings: [],
    });

    const loaded = await assets.getAssetById(created.id);

    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe(created.id);
    expect(loaded?.characterName).toBe("Rin");
    expect(loaded?.openingMessage).toBe("Welcome back.");
    expect(loaded?.kind).toBe("character-card-json");
  });

  it("updates author override and tags for an existing asset", async () => {
    const db = await createDatabaseClient({ inMemory: true });
    clients.push(db);

    const posts = createPostService(db);
    const assets = createAssetService(db);

    const post = await posts.createDraft({ sourceUrl: "https://example.com/source/thread-8" });
    const created = await assets.createAsset({
      postId: post.id,
      kind: "character-card-png",
      originalFilename: "rin.png",
      storageKey: "data/originals/rin.png",
    });

    const updated = await assets.updateAssetMetadata({
      assetId: created.id,
      authorNameOverride: "Archivist CMYK",
      tags: ["favorite", "archive"],
    });

    expect(updated.authorNameOverride).toBe("Archivist CMYK");
    expect(updated.tags).toEqual(["favorite", "archive"]);
  });
});
