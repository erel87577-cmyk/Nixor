import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LibraryPage } from "@/features/library/LibraryPage";

describe("library page", () => {
  it("filters by author and tag search input", async () => {
    const user = userEvent.setup();

    render(
      <LibraryPage
        initialItems={[
          { id: "1", title: "Post A", authorName: "Alice", tags: ["fantasy"] },
          { id: "2", title: "Post B", authorName: "Bob", tags: ["modern"] },
        ]}
      />,
    );

    await user.type(screen.getByPlaceholderText("Search posts, assets, authors, tags"), "Alice");

    expect(screen.getByText("Post A")).toBeTruthy();
    expect(screen.queryByText("Post B")).toBeNull();
  });
});
