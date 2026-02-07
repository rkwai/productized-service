import { test, expect } from "@playwright/test";

test("happy path navigation and admin metadata update work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();

  await expect(page.locator('[data-page="home"]')).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Home / Owner Summary" })).toBeVisible();
  await expect(
    page.locator('[data-page="home"] .kpi-group').first().getByText("Customer LTV:CAC")
  ).toBeVisible();
  await expect(page.getByText("Spend recommendation")).toBeVisible();

  await page.getByRole("link", { name: "Customers" }).click();
  await expect(page.locator('[data-page="portfolio"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Profitability by segment" })).toBeVisible();

  const customersPanel = page
    .getByRole("heading", { level: 3, name: "Customers" })
    .locator("..");
  const firstAccountRow = customersPanel.locator("table tbody tr").first();
  await firstAccountRow.locator("td").nth(1).click();
  await expect(customersPanel.locator(".object-panel")).toBeVisible();

  await page.getByRole("link", { name: "Activation Health" }).click();
  await expect(page.locator('[data-page="engagement-health"]')).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.locator('[data-page="admin"]')).toBeVisible();

  const companyNameField = page
    .locator("[data-page='admin'] .field-group")
    .filter({ hasText: /company name/i })
    .first()
    .locator("input");

  await companyNameField.fill("Acme Analytics");

  const jsonOutput = page.locator("#json-output");
  await expect(jsonOutput).toHaveValue(/"company_name": "Acme Analytics"/);
});
