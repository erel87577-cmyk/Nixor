import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./shell/AppShell";
import { LibraryPage } from "@/features/library/LibraryPage";
import { ImportPage } from "@/features/import/ImportPage";
import { PostDetailPage } from "@/features/posts/PostDetailPage";
import { AssetDetailPage } from "@/features/assets/AssetDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <LibraryPage />,
      },
      {
        path: "import",
        element: <ImportPage />,
      },
      {
        path: "posts/:postId",
        element: <PostDetailPage />,
      },
      {
        path: "assets/:assetId",
        element: <AssetDetailPage />,
      },
    ],
  },
]);
