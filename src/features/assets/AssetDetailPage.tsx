import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AuthorField } from "@/features/ui/AuthorField";
import { EmptyState } from "@/features/ui/EmptyState";
import { TagEditor } from "@/features/ui/TagEditor";
import { getRendererApi } from "@/renderer/api";
import type { AssetRecord } from "@/shared/domain";

export function AssetDetailPage() {
  const { assetId = "" } = useParams();
  const [asset, setAsset] = useState<AssetRecord | null>(null);
  const [preview, setPreview] = useState<
    | { kind: "image"; dataUrl: string }
    | { kind: "text"; content: string }
    | { kind: "empty" }
  >({ kind: "empty" });
  const [authorName, setAuthorName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    let cancelled = false;
    void getRendererApi()
      .getAssetDetail({ assetId })
      .then((result) => {
        if (!cancelled) {
          setAsset(result);
          setAuthorName(result?.authorNameOverride ?? "");
          setTagInput(result?.tags.join(", ") ?? "");
        }
      });
    void getRendererApi()
      .getAssetPreview({ assetId })
      .then((result) => {
        if (!cancelled) {
          setPreview(result);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [assetId]);

  if (!asset) {
    return (
      <main className="detail-page">
        <EmptyState
          title="Asset not found"
          body="This asset is not available yet. Import a file from a source post to populate this screen."
        />
      </main>
    );
  }

  const currentAsset = asset;

  async function handleSaveMetadata() {
    const updated = await getRendererApi().updateAssetMetadata({
      assetId: currentAsset.id,
      authorNameOverride: authorName.trim() || null,
      tags: tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    if (updated) {
      setAsset(updated);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    }
  }

  async function handleExportOriginal() {
    await getRendererApi().exportAsset({ assetId: currentAsset.id });
  }

  return (
    <main className="detail-page">
      <section className="detail-card">
        <p className="eyebrow">Asset</p>
        <h1>{currentAsset.displayName}</h1>
        <AuthorField value={currentAsset.authorNameOverride || ""} />
        <p>{currentAsset.descriptionSummary || currentAsset.originalFilename}</p>
        <TagEditor tags={currentAsset.tags} />
        <div className="hero-actions hero-actions--start">
          <button type="button" className="filter-chip filter-chip--active" onClick={() => void handleExportOriginal()}>
            Export Original
          </button>
        </div>
        <div className="detail-card detail-card--nested">
          <p className="eyebrow">Preview</p>
          {preview.kind === "image" ? (
            <img className="asset-preview-image" src={preview.dataUrl} alt={currentAsset.displayName} />
          ) : preview.kind === "text" ? (
            <pre className="asset-preview-text">{preview.content}</pre>
          ) : (
            <EmptyState
              title="No preview available"
              body="This asset type does not have a preview yet, but the original file is still preserved and exportable."
            />
          )}
        </div>
        <div className="detail-grid">
          <div className="detail-note">
            <strong>Type</strong>
            <span>{currentAsset.kind}</span>
          </div>
          <div className="detail-note">
            <strong>Character Name</strong>
            <span>{currentAsset.characterName || "Not parsed yet"}</span>
          </div>
          <div className="detail-note">
            <strong>Opening Message</strong>
            <span>{currentAsset.openingMessage || "No opening message available."}</span>
          </div>
          <div className="detail-note">
            <strong>Original File</strong>
            <span>{currentAsset.originalFilename}</span>
          </div>
        </div>
        <div className="detail-card detail-card--nested">
          <p className="eyebrow">Edit Metadata</p>
          <label className="field-stack">
            <span className="meta-label">Author Override</span>
            <input
              className="library-search"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              placeholder="Manual author name"
            />
          </label>
          <label className="field-stack">
            <span className="meta-label">Tags</span>
            <input
              className="library-search"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="tag-one, tag-two"
            />
          </label>
          <div className="hero-actions hero-actions--start">
            <button type="button" className="filter-chip filter-chip--active" onClick={() => void handleSaveMetadata()}>
              Save Metadata
            </button>
            {saveState === "saved" ? <span className="save-state">Saved</span> : null}
          </div>
        </div>
        <Link className="text-link" to={`/posts/${currentAsset.postId}`}>
          Back to Source Post
        </Link>
      </section>
    </main>
  );
}
