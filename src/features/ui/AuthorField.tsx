interface AuthorFieldProps {
  label?: string;
  value: string;
}

export function AuthorField({ label = "Author", value }: AuthorFieldProps) {
  return (
    <div className="meta-stack">
      <span className="meta-label">{label}</span>
      <strong>{value || "Unknown author"}</strong>
    </div>
  );
}
