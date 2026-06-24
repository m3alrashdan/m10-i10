import { test, expect } from "@playwright/test";

test("kg page renders and returns rows", async ({ page }) => {
  await page.goto("http://localhost:3000/kg");

  await expect(
    page.getByRole("heading", { name: /knowledge graph/i })
  ).toBeVisible();

  await page.getByLabel(/question/i).fill("Find Sichuan recipes");

  await page.getByRole("button", { name: /ask/i }).click();

  await expect(page.getByText(/cypher/i)).toBeVisible({ timeout: 15_000 });

  await expect(
    page.getByTestId("kg-row").first()
  ).toBeVisible({ timeout: 15_000 });
});