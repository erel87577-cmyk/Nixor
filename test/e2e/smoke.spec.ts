import { expect, test } from "@playwright/test";

test("user can create a source post draft and see it in the library", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/");
  await page.getByRole("link", { name: "Import" }).click();
  await page.getByLabel("Source URL").fill("https://example.com/community/thread-99");
  await page.getByRole("button", { name: "Create Draft" }).click();
  await expect(page.getByText("https://example.com/community/thread-99")).toBeVisible();
  await expect(page.getByText("Untitled import")).toBeVisible();
  await page.getByRole("link", { name: "Back to Library" }).click();
  await expect(page.getByRole("heading", { name: "Nixor" })).toBeVisible();
  await expect(page.getByText("https://example.com/community/thread-99")).toBeVisible();
  await expect(page.getByText("Untitled import")).toBeVisible();
});
