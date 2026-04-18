import { AuthorField } from "@/features/ui/AuthorField";
import { TagEditor } from "@/features/ui/TagEditor";

const placeholderAsset = {
  title: "Rin character card",
  authorName: "Manual author",
  tags: ["character", "png"],
  summary: "Character preview, parsed greeting, original file info, and export controls will live here.",
};

export function AssetDetailPage() {
  return (
    <main className="detail-page">
      <section className="detail-card">
        <p className="eyebrow">Asset</p>
        <h1>{placeholderAsset.title}</h1>
        <AuthorField value={placeholderAsset.authorName} />
        <p>{placeholderAsset.summary}</p>
        <TagEditor tags={placeholderAsset.tags} />
      </section>
    </main>
  );
}
