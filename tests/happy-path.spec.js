const { test, expect } = require("@playwright/test");

test("cockpit loads and reflects edits in JSON", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Client Value Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Executive Overview" })).toBeVisible();

  await page.goto("/#/accounts");

  const accountField = page
    .locator("[data-page='accounts'] .field-group")
    .filter({ hasText: "account name" })
    .first()
    .locator("input");

  await accountField.fill("Acme Analytics");

  await page.goto("/#/json-export");
  const jsonOutput = page.locator("#json-output");
  await expect(jsonOutput).toHaveValue(/"account_name": "Acme Analytics"/);
});
