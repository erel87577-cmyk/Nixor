import type { AssetRecord } from "@/shared/domain";
import { afterEach, describe, expect, it } from "vitest";

import { createAssetService } from "@/main/services/asset-service";
import { createDatabaseClient } from "@/main/db/client";
import { createPostService } from "@/main/services/post-service";

describe("post and asset relations", () => {
  const clients: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    await Promise.all(clients.splice(0).map((client) => client.close()));
  });

  it("persists multiple assets under one post and returns them in library detail", async () => {
    const db = await createDatabaseClient({ inMemory: true });
    clients.push(db);

    const postService = createPostService(db);
    const assetService = createAssetService(db);

    const post = await postService.createPost({
      authorName: "cyan",
      body: "A quiet card archive entry",
      sourceUrl: "https://example.com/post/1",
      sourceTags: ["fantasy", "imported"],
      title: "Archive Source",
      userTags: ["favorite"],
    });

    const firstAsset = await assetService.createAsset({
      postId: post.id,
      kind: "character-card-png",
      originalFilename: "mio.png",
      storageKey: "assets/mio.png",
      characterName: "Mio",
      openingMessage: "Welcome back.",
    });

    const secondAsset = await assetService.createAsset({
      postId: post.id,
      kind: "worldbook",
      originalFilename: "mio-world.json",
      storageKey: "assets/mio-world.json",
    });

    const detail = await postService.getPostDetail(post.id);

    expect(detail).not.toBeNull();
    expect(detail?.post.id).toBe(post.id);
    expect(detail?.post.authorName).toBe("cyan");
    expect(detail?.post.sourceTags).toEqual(["fantasy", "imported"]);
    expect(detail?.post.userTags).toEqual(["favorite"]);
    expect(detail?.post.tags).toEqual(["fantasy", "imported", "favorite"]);
    expect(detail?.assets.map((asset: AssetRecord) => asset.id)).toEqual([firstAsset.id, secondAsset.id]);
    expect(detail?.assets[0]).toMatchObject({
      characterName: "Mio",
      kind: "character-card-png",
      openingMessage: "Welcome back.",
    });
    expect(detail?.assets[1]).toMatchObject({
      kind: "worldbook",
      originalFilename: "mio-world.json",
    });
  });

  it("rejects assets that point at a missing post", async () => {
    const db = await createDatabaseClient({ inMemory: true });
    clients.push(db);

    const assetService = createAssetService(db);

    await expect(
      assetService.createAsset({
        postId: "post_missing",
        kind: "character-card-json",
        originalFilename: "ghost.json",
        storageKey: "assets/ghost.json",
      }),
    ).rejects.toThrow(/post/i);
  });

  it("updates manual post tags without losing imported source tags", async () => {
    const db = await createDatabaseClient({ inMemory: true });
    clients.push(db);

    const postService = createPostService(db);

    const post = await postService.createPost({
      authorName: "cyan",
      body: "Archive entry",
      sourceUrl: "https://example.com/post/2",
      sourceTags: ["fantasy", "community"],
      title: "Tag Source",
      userTags: ["favorite"],
    });

    const updated = await postService.updatePostMetadata({
      postId: post.id,
      authorName: "cyan",
      userTags: ["favorite", "keeper"],
      notes: "keep this source around",
    });

    expect(updated.sourceTags).toEqual(["fantasy", "community"]);
    expect(updated.userTags).toEqual(["favorite", "keeper"]);
    expect(updated.tags).toEqual(["fantasy", "community", "favorite", "keeper"]);
    expect(updated.notes).toBe("keep this source around");
  });
});
