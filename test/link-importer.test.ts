import { describe, expect, it } from "vitest";

import { LinkImporter } from "@/main/import/link-importer";

describe("link importer", () => {
  it("falls back to a draft-like link-only import when parsing is incomplete", async () => {
    const importer = new LinkImporter();

    const result = await importer.importFromHtml({
      sourceUrl: "https://example.com/thread/1",
      html: "<html><body><div>Only partial content</div></body></html>",
    });

    expect(result.importStatus).toBe("link_only");
    expect(result.title).toBe("Untitled import");
    expect(result.sourceUrl).toBe("https://example.com/thread/1");
    expect(result.imageUrls).toEqual([]);
  });

  it("marks richer imports as full when title, body, and images are present", async () => {
    const importer = new LinkImporter();

    const result = await importer.importFromHtml({
      sourceUrl: "https://example.com/thread/2",
      html: `
        <html>
          <head><title>Collected thread</title></head>
          <body>
            <article>
              <p>This is a longer first post body with enough detail to count as a real import target.</p>
              <img src="https://cdn.example.com/preview.png" />
            </article>
          </body>
        </html>
      `,
    });

    expect(result.importStatus).toBe("full");
    expect(result.title).toBe("Collected thread");
    expect(result.imageUrls).toEqual(["https://cdn.example.com/preview.png"]);
  });
});
