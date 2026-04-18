import path from "node:path";

export interface AppPaths {
  root: string;
  databaseFile: string;
  originalsDir: string;
  previewsDir: string;
}

export function resolveAppPaths(root: string): AppPaths {
  const dataRoot = path.join(root, "data");

  return {
    root,
    databaseFile: path.join(dataRoot, "nixor.sqlite"),
    originalsDir: path.join(dataRoot, "originals"),
    previewsDir: path.join(dataRoot, "previews"),
  };
}
