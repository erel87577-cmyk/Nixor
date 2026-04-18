import { AuthorField } from "@/features/ui/AuthorField";
import { TagEditor } from "@/features/ui/TagEditor";

const placeholderPost = {
  title: "Imported source thread",
  body: "This is where the source post title, body, images, notes, and attached assets will render once the task wiring is complete.",
  authorName: "Manual author",
  tags: ["source", "draft"],
};

export function PostDetailPage() {
  return (
    <main className="detail-page">
      <section className="detail-card">
        <p className="eyebrow">Source Post</p>
        <h1>{placeholderPost.title}</h1>
        <AuthorField value={placeholderPost.authorName} />
        <p>{placeholderPost.body}</p>
        <TagEditor tags={placeholderPost.tags} />
      </section>
    </main>
  );
}
