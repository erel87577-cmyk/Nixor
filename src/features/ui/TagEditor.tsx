interface TagEditorProps {
  tags: string[];
}

export function TagEditor({ tags }: TagEditorProps) {
  return (
    <div className="tag-row" aria-label="Tags">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
        </span>
      ))}
    </div>
  );
}
