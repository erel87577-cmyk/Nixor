import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AuthorField } from "@/features/ui/AuthorField";
import { TagEditor } from "@/features/ui/TagEditor";
import { EmptyState } from "@/features/ui/EmptyState";
import { getRendererApi } from "@/renderer/api";
import type { AssetRecord, PostDetail } from "@/shared/domain";

export function PostDetailPage() {
  const { postId = "" } = useParams();
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [userTagInput, setUserTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    let cancelled = false;
    void getRendererApi()
      .getPostDetail({ postId })
      .then((result) => {
        if (!cancelled) {
          setDetail(result);
          setAuthorName(result?.post.authorName ?? "");
          setUserTagInput(result?.post.userTags.join(", ") ?? "");
          setNotes(result?.post.notes ?? "");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleImportAsset() {
    const created = await getRendererApi().importAssetToPost({ postId });
    if (!created) {
      return;
    }

    const refreshed = await getRendererApi().getPostDetail({ postId });
    setDetail(refreshed);
  }

  async function handleSavePostMetadata() {
    if (!detail) {
      return;
    }

    const updatedPost = await getRendererApi().updatePostMetadata({
      postId,
      authorName: authorName.trim(),
      userTags: userTagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes,
    });

    if (!updatedPost) {
      return;
    }

    setDetail((current) => (current ? { ...current, post: updatedPost } : current));
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1500);
  }

  if (!detail) {
    return (
      <main className="detail-page">
        <EmptyState
          title="Post not found"
          body="This source post is not available yet. Try going back to the library and selecting another item."
        />
      </main>
    );
  }

  const { post, assets } = detail;

  return (
    <main className="detail-page">
      <section className="detail-card">
        <p className="eyebrow">Source Post</p>
        <h1>{post.title}</h1>
        <AuthorField value={post.authorName} />
        <p>{post.body || post.sourceUrl || "No source body captured yet."}</p>
        <div className="detail-grid">
          <div className="detail-card detail-card--nested">
            <p className="eyebrow">Source Tags</p>
            <TagEditor tags={post.sourceTags} />
          </div>
          <div className="detail-card detail-card--nested">
            <p className="eyebrow">Manual Tags</p>
            <TagEditor tags={post.userTags} />
          </div>
        </div>
        <div className="detail-note">
          <strong>Source URL</strong>
          <span>{post.sourceUrl || "No source link recorded."}</span>
        </div>
        <div className="hero-actions hero-actions--start">
          <button type="button" className="filter-chip filter-chip--active" onClick={() => void handleImportAsset()}>
            Import Asset File
          </button>
        </div>
        <div className="detail-card detail-card--nested">
          <p className="eyebrow">Edit Post Metadata</p>
          <label className="field-stack">
            <span className="meta-label">Author</span>
            <input
              className="library-search"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              placeholder="Manual author name"
            />
          </label>
          <label className="field-stack">
            <span className="meta-label">Manual Tags</span>
            <input
              className="library-search"
              value={userTagInput}
              onChange={(event) => setUserTagInput(event.target.value)}
              placeholder="favorite, archive, nsfw"
            />
          </label>
          <label className="field-stack">
            <span className="meta-label">Notes</span>
            <input
              className="library-search"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Personal notes about this source"
            />
          </label>
          <div className="hero-actions hero-actions--start">
            <button type="button" className="filter-chip filter-chip--active" onClick={() => void handleSavePostMetadata()}>
              Save Post Metadata
            </button>
            {saveState === "saved" ? <span className="save-state">Saved</span> : null}
          </div>
        </div>
      </section>

      <section className="detail-card">
        <p className="eyebrow">Attached Assets</p>
        {assets.length === 0 ? (
          <EmptyState
            title="No assets attached yet"
            body="Import a PNG or JSON file to add the first asset under this source post."
          />
        ) : (
          <div className="asset-list">
            {assets.map((asset: AssetRecord) => (
              <article key={asset.id} className="asset-row">
                <div>
                  <h2>{asset.displayName}</h2>
                  <p>{asset.characterName || asset.originalFilename}</p>
                </div>
                <Link className="text-link" to={`/assets/${asset.id}`}>
                  Open Asset
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
