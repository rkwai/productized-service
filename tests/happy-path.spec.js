const { test, expect } = require("@playwright/test");

test("dashboard loads and reflects edits in JSON", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Client Value Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Business value focus" })).toBeVisible();

  const summaryTiles = page.locator("#summary-grid .summary-tile");
  await expect(summaryTiles).toHaveCount(5);

  const companyField = page
    .locator("#client-metadata .field-group")
    .filter({ hasText: "company name" })
    .locator("input");

  await companyField.fill("Acme Analytics");
  await expect(page.getByRole("heading", { level: 1, name: "Acme Analytics" })).toBeVisible();

  const jsonOutput = page.locator("#json-output");
  await expect(jsonOutput).toHaveValue(/"company_name": "Acme Analytics"/);
});
