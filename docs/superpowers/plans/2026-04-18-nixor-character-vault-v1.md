# Nixor Character Vault V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first desktop app for collecting source posts and SillyTavern-related assets with stable import flows, author/tag organization, and lossless PNG preservation/export.

**Architecture:** Use Electron as the desktop shell, Vite + React + TypeScript for the UI, SQLite for metadata, and a managed local filesystem repository with strict separation between immutable original assets and derived preview files. The app will model data as source posts with child assets and will favor graceful import fallback over brittle automation.

**Tech Stack:** Electron, Vite, React, TypeScript, better-sqlite3, Zod, React Router, Vitest, Testing Library, Playwright, Sharp

---

## File Structure

### App and tooling

- Create: `C:\Users\huge1\Desktop\Nixor\package.json`
- Create: `C:\Users\huge1\Desktop\Nixor\tsconfig.json`
- Create: `C:\Users\huge1\Desktop\Nixor\tsconfig.node.json`
- Create: `C:\Users\huge1\Desktop\Nixor\vite.config.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\vitest.config.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\playwright.config.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\electron\main.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\electron\preload.ts`

### Renderer app

- Create: `C:\Users\huge1\Desktop\Nixor\src\main.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\App.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\app\router.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\app\shell\AppShell.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\styles\globals.css`
- Create: `C:\Users\huge1\Desktop\Nixor\src\styles\tokens.css`

### Shared domain and validation

- Create: `C:\Users\huge1\Desktop\Nixor\src\shared\domain.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\shared\contracts.ts`

### Main-process data and storage services

- Create: `C:\Users\huge1\Desktop\Nixor\src\main\db\schema.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\db\client.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\db\migrate.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\paths.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\asset-store.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\preview-store.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\post-service.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\asset-service.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\export-service.ts`

### Import and parsing

- Create: `C:\Users\huge1\Desktop\Nixor\src\main\import\link-importer.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\import\html-parser.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\import\file-importer.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\parsers\character-card.ts`

### IPC layer

- Create: `C:\Users\huge1\Desktop\Nixor\src\main\ipc.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\renderer\api.ts`

### UI features

- Create: `C:\Users\huge1\Desktop\Nixor\src\features\library\LibraryPage.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\library\LibraryFilters.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\posts\PostDetailPage.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\assets\AssetDetailPage.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\import\ImportPage.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\ui\EmptyState.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\ui\TagEditor.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\ui\AuthorField.tsx`

### Tests and fixtures

- Create: `C:\Users\huge1\Desktop\Nixor\test\fixtures\sample-card.png`
- Create: `C:\Users\huge1\Desktop\Nixor\test\fixtures\sample-card.json`
- Create: `C:\Users\huge1\Desktop\Nixor\test\fixtures\sample-link.html`
- Create: `C:\Users\huge1\Desktop\Nixor\test\asset-preservation.test.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\test\post-asset-relations.test.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\test\link-importer.test.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\test\character-parser.test.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\test\library-ui.test.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\test\e2e\smoke.spec.ts`

## Task 1: Bootstrap The Desktop App Workspace

**Files:**
- Create: `C:\Users\huge1\Desktop\Nixor\package.json`
- Create: `C:\Users\huge1\Desktop\Nixor\tsconfig.json`
- Create: `C:\Users\huge1\Desktop\Nixor\tsconfig.node.json`
- Create: `C:\Users\huge1\Desktop\Nixor\vite.config.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\vitest.config.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\playwright.config.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\electron\main.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\electron\preload.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\App.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\app\router.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\app\shell\AppShell.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\styles\globals.css`
- Create: `C:\Users\huge1\Desktop\Nixor\src\styles\tokens.css`
- Test: `C:\Users\huge1\Desktop\Nixor\test\e2e\smoke.spec.ts`

- [ ] **Step 1: Write the failing smoke test for app startup**

```ts
import { test, expect } from "@playwright/test";

test("library shell renders", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("heading", { name: "Nixor" })).toBeVisible();
  await expect(page.getByPlaceholder("Search posts, assets, authors, tags")).toBeVisible();
});
```

- [ ] **Step 2: Run the smoke test to confirm the app does not exist yet**

Run: `npx playwright test test/e2e/smoke.spec.ts`
Expected: FAIL with a navigation or connection error because the app has not been scaffolded yet.

- [ ] **Step 3: Create the package manifest and scripts**

```json
{
  "name": "nixor",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "better-sqlite3": "^11.7.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.0",
    "sharp": "^0.34.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.0",
    "@types/node": "^22.15.0",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.0",
    "electron": "^35.2.0",
    "typescript": "^5.8.0",
    "vite": "^6.3.0",
    "vitest": "^3.1.0"
  }
}
```

- [ ] **Step 4: Add TypeScript and Vite configuration**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "electron", "test"]
}
```

- [ ] **Step 5: Create the shell UI with the first visible heading**

```tsx
// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./styles/tokens.css";
import "./styles/globals.css";

export function App() {
  return <RouterProvider router={router} />;
}
```

```tsx
// src/features/library/LibraryPage.tsx
export function LibraryPage() {
  return (
    <main>
      <h1>Nixor</h1>
      <input placeholder="Search posts, assets, authors, tags" />
    </main>
  );
}
```

- [ ] **Step 6: Run the smoke test again**

Run: `npx playwright test test/e2e/smoke.spec.ts`
Expected: PASS with the heading and search field visible.

- [ ] **Step 7: Commit the bootstrap**

```bash
git init
git add package.json tsconfig.json vite.config.ts vitest.config.ts playwright.config.ts electron src test
git commit -m "chore: bootstrap nixor desktop app"
```

## Task 2: Build The Metadata Schema And Managed Storage Boundaries

**Files:**
- Create: `C:\Users\huge1\Desktop\Nixor\src\shared\domain.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\shared\contracts.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\db\schema.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\db\client.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\db\migrate.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\paths.ts`
- Test: `C:\Users\huge1\Desktop\Nixor\test\post-asset-relations.test.ts`

- [ ] **Step 1: Write the failing relationship test**

```ts
import { describe, expect, it } from "vitest";
import { createTestDatabase } from "../src/main/db/client";
import { migrate } from "../src/main/db/migrate";
import { PostService } from "../src/main/services/post-service";
import { AssetService } from "../src/main/services/asset-service";

describe("post and asset relations", () => {
  it("stores assets under a source post", () => {
    const db = createTestDatabase();
    migrate(db);

    const posts = new PostService(db);
    const assets = new AssetService(db);

    const post = posts.createDraft({
      sourceUrl: "https://example.com/post/1",
      title: "Collected thread",
      authorName: "demo-author",
    });

    const asset = assets.createMetadata({
      sourcePostId: post.id,
      assetType: "character_card_png",
      displayName: "Example Card",
      originalFileName: "example.png",
    });

    expect(asset.sourcePostId).toBe(post.id);
    expect(posts.getWithAssets(post.id)?.assets).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the relationship test to verify missing schema/services**

Run: `npx vitest run test/post-asset-relations.test.ts`
Expected: FAIL because the database client, migration, and services do not exist yet.

- [ ] **Step 3: Define the shared domain contracts**

```ts
// src/shared/domain.ts
export type AssetType =
  | "character_card_png"
  | "character_card_json"
  | "worldbook"
  | "quick_reply"
  | "image"
  | "other_file";

export type ImportStatus = "draft" | "full" | "partial" | "link_only";

export interface SourcePostRecord {
  id: string;
  sourceUrl: string | null;
  sourceType: string | null;
  title: string;
  body: string;
  coverImageAssetId: string | null;
  authorName: string;
  tags: string[];
  notes: string;
  importStatus: ImportStatus;
  importedAt: string;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 4: Create the SQLite schema and migration**

```ts
// src/main/db/schema.ts
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS source_posts (
  id TEXT PRIMARY KEY,
  source_url TEXT,
  source_type TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  cover_image_asset_id TEXT,
  author_name TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  import_status TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  source_post_id TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  author_name_override TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  original_file_name TEXT NOT NULL,
  original_extension TEXT NOT NULL DEFAULT '',
  storage_path TEXT,
  preview_path TEXT,
  mime_type TEXT,
  file_size INTEGER,
  checksum TEXT,
  character_name TEXT,
  greeting TEXT,
  description_summary TEXT,
  raw_parsed_metadata_json TEXT NOT NULL DEFAULT '{}',
  parse_status TEXT NOT NULL DEFAULT 'pending',
  parse_warnings_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (source_post_id) REFERENCES source_posts(id)
);
`;
```

- [ ] **Step 5: Implement the database client and path service**

```ts
// src/main/services/paths.ts
import path from "node:path";

export interface AppPaths {
  root: string;
  dbFile: string;
  originalsDir: string;
  previewsDir: string;
}

export function resolveAppPaths(root: string): AppPaths {
  return {
    root,
    dbFile: path.join(root, "data", "nixor.sqlite"),
    originalsDir: path.join(root, "data", "originals"),
    previewsDir: path.join(root, "data", "previews"),
  };
}
```

- [ ] **Step 6: Run the relationship test again**

Run: `npx vitest run test/post-asset-relations.test.ts`
Expected: PASS with one stored asset under one source post.

- [ ] **Step 7: Commit the data foundations**

```bash
git add src/shared src/main/db src/main/services/paths.ts test/post-asset-relations.test.ts
git commit -m "feat: add nixor metadata schema and path model"
```

## Task 3: Implement Immutable Original Asset Storage And Lossless Export

**Files:**
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\asset-store.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\preview-store.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\asset-service.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\services\export-service.ts`
- Test: `C:\Users\huge1\Desktop\Nixor\test\asset-preservation.test.ts`
- Test: `C:\Users\huge1\Desktop\Nixor\test\fixtures\sample-card.png`

- [ ] **Step 1: Write the failing byte-preservation test**

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { AssetStore } from "../src/main/services/asset-store";
import { ExportService } from "../src/main/services/export-service";

function sha(filePath: string) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

describe("asset preservation", () => {
  it("exports the exact original PNG bytes", async () => {
    const sample = path.resolve("test/fixtures/sample-card.png");
    const store = new AssetStore(path.resolve("tmp/test-originals"));
    const exportService = new ExportService();

    const stored = await store.importFile(sample, "sample-card.png");
    const out = path.resolve("tmp/exported-card.png");

    await exportService.copyOriginal(stored.storagePath, out);

    expect(sha(out)).toBe(sha(sample));
  });
});
```

- [ ] **Step 2: Run the preservation test to verify the storage service is missing**

Run: `npx vitest run test/asset-preservation.test.ts`
Expected: FAIL because the original-asset store and export service do not exist.

- [ ] **Step 3: Implement immutable original storage**

```ts
// src/main/services/asset-store.ts
import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";

export class AssetStore {
  constructor(private readonly originalsDir: string) {}

  async importFile(sourcePath: string, originalFileName: string) {
    const bytes = await fs.readFile(sourcePath);
    const checksum = createHash("sha256").update(bytes).digest("hex");
    const ext = path.extname(originalFileName);
    const targetName = `${randomUUID()}${ext}`;
    const storagePath = path.join(this.originalsDir, targetName);

    await fs.mkdir(this.originalsDir, { recursive: true });
    await fs.writeFile(storagePath, bytes);

    return {
      storagePath,
      checksum,
      fileSize: bytes.byteLength,
      originalExtension: ext,
    };
  }
}
```

- [ ] **Step 4: Implement preview generation as a separate derivative path**

```ts
// src/main/services/preview-store.ts
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export class PreviewStore {
  constructor(private readonly previewsDir: string) {}

  async createImagePreview(originalPath: string, previewName: string) {
    await fs.mkdir(this.previewsDir, { recursive: true });
    const previewPath = path.join(this.previewsDir, `${previewName}.webp`);

    await sharp(originalPath)
      .resize({ width: 480, height: 480, fit: "inside" })
      .webp({ quality: 80 })
      .toFile(previewPath);

    return previewPath;
  }
}
```

- [ ] **Step 5: Implement the export service as a byte copy only**

```ts
// src/main/services/export-service.ts
import fs from "node:fs/promises";
import path from "node:path";

export class ExportService {
  async copyOriginal(storagePath: string, destinationPath: string) {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(storagePath, destinationPath);
  }
}
```

- [ ] **Step 6: Run the preservation test again**

Run: `npx vitest run test/asset-preservation.test.ts`
Expected: PASS with matching checksums before and after export.

- [ ] **Step 7: Commit the immutable storage layer**

```bash
git add src/main/services/asset-store.ts src/main/services/preview-store.ts src/main/services/export-service.ts test/asset-preservation.test.ts test/fixtures/sample-card.png
git commit -m "feat: preserve original card bytes and add lossless export"
```

## Task 4: Add Source-Post Link Import And Character Card Parsing With Graceful Fallback

**Files:**
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\import\html-parser.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\import\link-importer.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\import\file-importer.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\parsers\character-card.ts`
- Test: `C:\Users\huge1\Desktop\Nixor\test\link-importer.test.ts`
- Test: `C:\Users\huge1\Desktop\Nixor\test\character-parser.test.ts`
- Test: `C:\Users\huge1\Desktop\Nixor\test\fixtures\sample-link.html`
- Test: `C:\Users\huge1\Desktop\Nixor\test\fixtures\sample-card.json`

- [ ] **Step 1: Write the failing link import fallback test**

```ts
import { describe, expect, it } from "vitest";
import { LinkImporter } from "../src/main/import/link-importer";

describe("link importer", () => {
  it("falls back to a draft post when parsing is incomplete", async () => {
    const importer = new LinkImporter();

    const result = await importer.importFromHtml({
      sourceUrl: "https://example.com/thread/1",
      html: "<html><body><div>Only partial content</div></body></html>",
    });

    expect(result.importStatus).toBe("link_only");
    expect(result.title).toBe("Untitled import");
    expect(result.sourceUrl).toBe("https://example.com/thread/1");
  });
});
```

- [ ] **Step 2: Write the failing character parser test**

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseCharacterCard } from "../src/main/parsers/character-card";

describe("character parser", () => {
  it("extracts character name and greeting from JSON cards", async () => {
    const filePath = path.resolve("test/fixtures/sample-card.json");
    const bytes = fs.readFileSync(filePath);

    const parsed = await parseCharacterCard(bytes, "sample-card.json", "application/json");

    expect(parsed.characterName).toBe("Rin");
    expect(parsed.greeting).toContain("Welcome back");
  });
});
```

- [ ] **Step 3: Run the import and parser tests**

Run: `npx vitest run test/link-importer.test.ts test/character-parser.test.ts`
Expected: FAIL because the link importer and character parser do not exist yet.

- [ ] **Step 4: Implement stable HTML extraction with fallback defaults**

```ts
// src/main/import/html-parser.ts
export interface ParsedSourceDraft {
  title: string;
  body: string;
  imageUrls: string[];
}

export function parseSourceHtml(html: string): ParsedSourceDraft {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const imgMatches = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1]);
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return {
    title: titleMatch?.[1]?.trim() || "Untitled import",
    body: text.slice(0, 4000),
    imageUrls: imgMatches,
  };
}
```

- [ ] **Step 5: Implement the link importer result model**

```ts
// src/main/import/link-importer.ts
import { parseSourceHtml } from "./html-parser";

export class LinkImporter {
  async importFromHtml(input: { sourceUrl: string; html: string }) {
    const parsed = parseSourceHtml(input.html);
    const hasEnoughContent = parsed.title !== "Untitled import" || parsed.body.length > 40;

    return {
      sourceUrl: input.sourceUrl,
      title: parsed.title,
      body: parsed.body,
      imageUrls: parsed.imageUrls,
      importStatus: hasEnoughContent ? "partial" : "link_only",
    } as const;
  }
}
```

- [ ] **Step 6: Implement character metadata extraction without mutating source bytes**

```ts
// src/main/parsers/character-card.ts
export async function parseCharacterCard(bytes: Buffer, fileName: string, mimeType: string) {
  if (mimeType === "application/json" || fileName.endsWith(".json")) {
    const json = JSON.parse(bytes.toString("utf8"));
    return {
      parseStatus: "parsed",
      characterName: json.name ?? "",
      greeting: json.first_mes ?? "",
      descriptionSummary: json.description?.slice(0, 200) ?? "",
      rawParsedMetadata: json,
      parseWarnings: [] as string[],
    };
  }

  return {
    parseStatus: "unsupported",
    characterName: "",
    greeting: "",
    descriptionSummary: "",
    rawParsedMetadata: {},
    parseWarnings: ["No supported parser for this file type yet."],
  };
}
```

- [ ] **Step 7: Run the import and parser tests again**

Run: `npx vitest run test/link-importer.test.ts test/character-parser.test.ts`
Expected: PASS with fallback import status and parsed JSON card fields.

- [ ] **Step 8: Commit the import/parsing layer**

```bash
git add src/main/import src/main/parsers test/link-importer.test.ts test/character-parser.test.ts test/fixtures/sample-link.html test/fixtures/sample-card.json
git commit -m "feat: add stable link import fallback and character parsing"
```

## Task 5: Expose App APIs Through IPC And Build The Core Library UI

**Files:**
- Create: `C:\Users\huge1\Desktop\Nixor\src\main\ipc.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\renderer\api.ts`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\library\LibraryPage.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\library\LibraryFilters.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\posts\PostDetailPage.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\assets\AssetDetailPage.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\import\ImportPage.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\ui\TagEditor.tsx`
- Create: `C:\Users\huge1\Desktop\Nixor\src\features\ui\AuthorField.tsx`
- Test: `C:\Users\huge1\Desktop\Nixor\test\library-ui.test.tsx`

- [ ] **Step 1: Write the failing library UI test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryPage } from "../src/features/library/LibraryPage";

describe("library page", () => {
  it("filters by author and tag", async () => {
    const user = userEvent.setup();

    render(
      <LibraryPage
        initialItems={[
          { id: "1", title: "Post A", authorName: "Alice", tags: ["fantasy"] },
          { id: "2", title: "Post B", authorName: "Bob", tags: ["modern"] }
        ]}
      />
    );

    await user.type(screen.getByPlaceholderText("Search posts, assets, authors, tags"), "Alice");

    expect(screen.getByText("Post A")).toBeInTheDocument();
    expect(screen.queryByText("Post B")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the UI test to verify the page contract is missing**

Run: `npx vitest run test/library-ui.test.tsx`
Expected: FAIL because the library page does not yet support initial items and filtering behavior.

- [ ] **Step 3: Implement the preload and renderer API surface**

```ts
// src/renderer/api.ts
export interface RendererApi {
  listPosts(): Promise<Array<{ id: string; title: string; authorName: string; tags: string[] }>>;
}

declare global {
  interface Window {
    nixor: RendererApi;
  }
}
```

```ts
// electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("nixor", {
  listPosts: () => ipcRenderer.invoke("posts:list"),
});
```

- [ ] **Step 4: Build the calm, low-saturation app shell**

```css
/* src/styles/tokens.css */
:root {
  --bg: #f5f4f1;
  --panel: rgba(255, 255, 255, 0.78);
  --panel-strong: #ffffff;
  --text: #1f1f1c;
  --muted: #6f6e69;
  --border: rgba(31, 31, 28, 0.08);
  --accent: #5c6f7b;
  --shadow: 0 16px 40px rgba(23, 23, 20, 0.08);
  --radius: 20px;
}
```

- [ ] **Step 5: Implement the library page with search, filter chips, and list/detail structure**

```tsx
// src/features/library/LibraryPage.tsx
import { useMemo, useState } from "react";

interface LibraryItem {
  id: string;
  title: string;
  authorName: string;
  tags: string[];
}

export function LibraryPage({ initialItems = [] as LibraryItem[] }) {
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return initialItems;

    return initialItems.filter((item) => {
      const haystack = [item.title, item.authorName, ...item.tags].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [initialItems, query]);

  return (
    <main>
      <header>
        <h1>Nixor</h1>
        <input
          placeholder="Search posts, assets, authors, tags"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </header>

      <section>
        {items.map((item) => (
          <article key={item.id}>
            <h2>{item.title}</h2>
            <p>{item.authorName}</p>
            <div>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </article>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Run the UI test again**

Run: `npx vitest run test/library-ui.test.tsx`
Expected: PASS with author-based filtering working in the library page.

- [ ] **Step 7: Commit the shell and core UI**

```bash
git add electron/preload.ts src/renderer/api.ts src/features src/styles test/library-ui.test.tsx
git commit -m "feat: add nixor library shell and core browsing ui"
```

## Task 6: Wire Import/Export End To End And Verify The Main Story

**Files:**
- Modify: `C:\Users\huge1\Desktop\Nixor\electron\main.ts`
- Modify: `C:\Users\huge1\Desktop\Nixor\src\main\ipc.ts`
- Modify: `C:\Users\huge1\Desktop\Nixor\src\main\services\post-service.ts`
- Modify: `C:\Users\huge1\Desktop\Nixor\src\main\services\asset-service.ts`
- Modify: `C:\Users\huge1\Desktop\Nixor\src\features\import\ImportPage.tsx`
- Modify: `C:\Users\huge1\Desktop\Nixor\src\features\assets\AssetDetailPage.tsx`
- Test: `C:\Users\huge1\Desktop\Nixor\test\e2e\smoke.spec.ts`

- [ ] **Step 1: Expand the e2e test to cover the main story**

```ts
import { test, expect } from "@playwright/test";

test("user can create a source post draft and see it in the library", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/");
  await page.getByRole("link", { name: "Import" }).click();
  await page.getByLabel("Source URL").fill("https://example.com/community/thread-99");
  await page.getByRole("button", { name: "Create Draft" }).click();
  await expect(page.getByText("https://example.com/community/thread-99")).toBeVisible();
  await expect(page.getByText("Untitled import")).toBeVisible();
});
```

- [ ] **Step 2: Run the e2e test to verify import actions are not wired**

Run: `npx playwright test test/e2e/smoke.spec.ts`
Expected: FAIL because import navigation and draft creation are not connected yet.

- [ ] **Step 3: Wire IPC handlers for list, create draft, import file, and export**

```ts
// src/main/ipc.ts
import { ipcMain } from "electron";

export function registerIpcHandlers(deps: {
  posts: { list: () => unknown; createDraft: (input: { sourceUrl: string }) => unknown };
  assets: { importFile: (input: { sourcePostId: string; filePath: string }) => unknown };
  exports: { exportAsset: (input: { assetId: string; destinationPath: string }) => unknown };
}) {
  ipcMain.handle("posts:list", () => deps.posts.list());
  ipcMain.handle("posts:createDraft", (_event, input) => deps.posts.createDraft(input));
  ipcMain.handle("assets:importFile", (_event, input) => deps.assets.importFile(input));
  ipcMain.handle("assets:export", (_event, input) => deps.exports.exportAsset(input));
}
```

- [ ] **Step 4: Connect the import page to the draft flow**

```tsx
// src/features/import/ImportPage.tsx
import { useState } from "react";

export function ImportPage() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [created, setCreated] = useState<{ title: string; sourceUrl: string } | null>(null);

  async function handleCreateDraft() {
    const result = await window.nixor.createDraftPost({ sourceUrl });
    setCreated(result);
  }

  return (
    <main>
      <label>
        Source URL
        <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
      </label>
      <button onClick={handleCreateDraft}>Create Draft</button>
      {created ? <section><p>{created.title}</p><p>{created.sourceUrl}</p></section> : null}
    </main>
  );
}
```

- [ ] **Step 5: Wire the asset detail export action to the original-file exporter**

```tsx
// src/features/assets/AssetDetailPage.tsx
export function AssetDetailPage({ assetId }: { assetId: string }) {
  async function handleExport() {
    await window.nixor.exportAsset({
      assetId,
      destinationPath: "exports/from-ui.png",
    });
  }

  return <button onClick={handleExport}>Export Original</button>;
}
```

- [ ] **Step 6: Run the test suite**

Run: `npx vitest run`
Expected: PASS for unit and component tests.

Run: `npx playwright test`
Expected: PASS for the basic import-draft user flow.

- [ ] **Step 7: Commit the end-to-end integration**

```bash
git add electron/main.ts src/main/ipc.ts src/main/services src/features/import src/features/assets test/e2e/smoke.spec.ts
git commit -m "feat: wire nixor import and export flows end to end"
```

## Self-Review

### Spec coverage

- Local app shell: covered in Task 1
- Source post + asset model: covered in Task 2
- Immutable original PNG storage and export: covered in Task 3
- Stable import fallback and character parsing: covered in Task 4
- Author/tag browsing UI with restrained visual direction: covered in Task 5
- End-to-end import/export path: covered in Task 6

### Placeholder scan

- No `TODO`, `TBD`, or "implement later" markers remain
- Every task includes concrete files, commands, and expected outcomes

### Type consistency

- `sourcePostId`, `assetType`, `importStatus`, `characterName`, and `greeting` names match across schema, tests, and services
- The plan consistently treats original storage as immutable and preview storage as derivative-only

## Notes Before Execution

- If `better-sqlite3` native install becomes a blocker on the target machine, switch to `sqlite3` or a WASM-backed SQLite adapter before implementing Task 2. Do not compromise the metadata/original/preview separation.
- If Electron packaging overhead slows early iteration too much, keep the renderer running in browser mode during development, but preserve the Electron preload + IPC boundary from the start.
