import { useEffect, useMemo, useState } from "react";

import { getRendererApi, type LibraryListItem } from "@/renderer/api";
import { AuthorField } from "@/features/ui/AuthorField";
import { EmptyState } from "@/features/ui/EmptyState";
import { TagEditor } from "@/features/ui/TagEditor";
import { LibraryFilters } from "./LibraryFilters";

interface LibraryPageProps {
  initialItems?: LibraryListItem[];
}

export function LibraryPage({ initialItems }: LibraryPageProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [items, setItems] = useState<LibraryListItem[]>(initialItems ?? []);

  useEffect(() => {
    if (initialItems) {
      return;
    }

    let cancelled = false;
    void getRendererApi()
      .listPosts()
      .then((results) => {
        if (!cancelled) {
          setItems(results);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialItems]);

  async function refreshItems() {
    const results = await getRendererApi().listPosts();
    setItems(results);
  }

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        needle.length === 0 ||
        [item.title, item.authorName, item.summary ?? "", ...item.tags]
          .join(" ")
          .toLowerCase()
          .includes(needle);

      if (!matchesSearch) {
        return false;
      }

      if (activeFilter === "authors") {
        return item.authorName.trim().length > 0;
      }

      if (activeFilter === "tags") {
        return item.tags.length > 0;
      }

      return true;
    });
  }, [activeFilter, items, query]);

  const authorCount = new Set(items.map((item) => item.authorName).filter(Boolean)).size;

  return (
    <main className="library-page">
      <section className="library-hero">
        <div className="library-title-row">
          <div>
            <p className="eyebrow">Collected characters</p>
            <h1>Nixor</h1>
            <p className="library-subtitle">
              A calm local vault for source posts, character cards, and the extra files you
              want nearby without cluttering SillyTavern itself.
            </p>
          </div>
          <div className="library-badge">Local first</div>
        </div>

        <input
          className="library-search"
          placeholder="Search posts, assets, authors, tags"
          aria-label="Search posts, assets, authors, tags"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <LibraryFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <div className="hero-actions">
          <button type="button" className="filter-chip" onClick={() => void refreshItems()}>
            Refresh
          </button>
        </div>
      </section>

      <section className="library-overview" aria-label="Overview">
        <div className="library-overview-card">
          <span>Posts</span>
          <strong>{items.length}</strong>
        </div>
        <div className="library-overview-card">
          <span>Visible</span>
          <strong>{filteredItems.length}</strong>
        </div>
        <div className="library-overview-card">
          <span>Authors</span>
          <strong>{authorCount}</strong>
        </div>
      </section>

      <section className="library-list" aria-label="Library preview">
        {filteredItems.length === 0 ? (
          <EmptyState
            title="Nothing matches this view yet"
            body="Try a different search, or switch filters to browse everything you have collected so far."
          />
        ) : null}

        {filteredItems.map((item) => (
          <article key={item.id}>
            <h2>{item.title}</h2>
            <div className="library-meta">
              <span>{item.id}</span>
            </div>
            <AuthorField value={item.authorName} />
            {item.summary ? <p>{item.summary}</p> : null}
            <TagEditor tags={item.tags} />
          </article>
        ))}
      </section>
    </main>
  );
}
