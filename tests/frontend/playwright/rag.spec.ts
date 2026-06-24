import { test, expect } from "@playwright/test";

test("rag page renders cited answer", async ({ page }) => {
  await page.goto("http://localhost:3000/rag");

  await expect(
    page.getByRole("heading", { name: /rag|retrieval/i })
  ).toBeVisible();

  await page
    .getByLabel(/question/i)
    .fill("How do I prep ginger for stir-fry?");

  await page.getByRole("button", { name: /ask/i }).click();

  await expect(
    page.getByTestId("rag-answer")
  ).toBeVisible({ timeout: 60_000 });

  await expect(
    page.getByTestId("citation-marker").first()
  ).toBeVisible({ timeout: 60_000 });
});