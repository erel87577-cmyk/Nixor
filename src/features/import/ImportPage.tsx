import { useState } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/features/ui/EmptyState";
import { getRendererApi, type LibraryListItem } from "@/renderer/api";

export function ImportPage() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [created, setCreated] = useState<LibraryListItem | null>(null);
  const [statusText, setStatusText] = useState("");

  async function handleImportSource() {
    if (!sourceUrl.trim()) {
      return;
    }

    setStatusText("Trying to parse the source link...");
    const result = await getRendererApi().importSourceLink({ sourceUrl: sourceUrl.trim() });
    setCreated(result);
    setStatusText(
      result.title === "Untitled import"
        ? "Automatic parsing fell back to a draft, but the source link was still saved."
        : "Source imported with parsed metadata.",
    );
  }

  return (
    <main className="detail-page">
      <section className="detail-card">
        <p className="eyebrow">Import</p>
        <h1>Bring a source into the vault</h1>
        <p className="detail-copy">
          Paste a community link first. If parsing is incomplete, Nixor will still keep the source
          as a draft so you can fill in the rest by hand.
        </p>

        <label className="field-stack">
          <span className="meta-label">Source URL</span>
          <input
            className="library-search"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://example.com/community/thread"
            aria-label="Source URL"
          />
        </label>

        <button type="button" className="filter-chip filter-chip--active" onClick={() => void handleImportSource()}>
          Import Source
        </button>

        {sourceUrl.length === 0 ? (
          <EmptyState
            title="No source pasted yet"
            body="Once a URL is entered, this screen will become the handoff point for parser results and manual completion."
          />
        ) : created ? (
          <div className="detail-note">
            <p>{statusText}</p>
            <p>
              <strong>{created.title}</strong>
            </p>
            <p>{created.sourceUrl ?? sourceUrl}</p>
            <Link className="text-link" to="/">
              Back to Library
            </Link>
          </div>
        ) : (
          <div className="detail-note">
            <p>{statusText || "Ready to import this link."}</p>
            <strong>{sourceUrl}</strong>
          </div>
        )}
      </section>
    </main>
  );
}
