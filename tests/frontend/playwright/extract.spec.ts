// Frontend lead — author this Playwright smoke test.
// Verifies the /extract page renders, accepts input, and displays
// typed entity results from the api service.


import { test, expect } from "@playwright/test";

test("extract page renders and returns entities", async ({ page }) => {
  await page.goto("http://localhost:3000/extract");

  await expect(
    page.getByRole("heading", { name: /extract/i })
  ).toBeVisible();

  await page
    .getByLabel(/text/i)
    .fill("Find Italian recipes with basil and garlic.");

  await page.getByRole("button", { name: /extract|submit/i }).click();

  await expect(page.getByText(/Italian/i)).toBeVisible();
  await expect(page.getByText(/basil|garlic/i)).toBeVisible();
});
