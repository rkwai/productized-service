const { test, expect } = require("@playwright/test");

test("navigation links and account happy path work", async ({ page }) => {
  await page.goto("/");

  const navExpectations = [
    { label: "Executive Overview", heading: "Executive Overview", page: "overview" },
    { label: "Accounts", heading: "Accounts", page: "accounts" },
    { label: "Engagements", heading: "Consulting engagements", page: "engagements" },
    { label: "Outcomes & KPIs", heading: "Outcomes & KPIs", page: "outcomes" },
    { label: "Risks & Issues", heading: "Risks & Issues", page: "risks" },
    { label: "Action Center", heading: "Action Center", page: "actions" },
    { label: "Ontology Studio", heading: "Ontology Studio", page: "ontology" },
    { label: "Data Integration", heading: "Data Integration", page: "data-integration" },
    { label: "Audit & Activity", heading: "Audit & Activity", page: "audit" },
    { label: "JSON Export", heading: "Current JSON", page: "json-export" },
  ];

  for (const item of navExpectations) {
    await page.getByRole("link", { name: item.label }).click();
    await expect(page.locator(`[data-page="${item.page}"]`)).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: item.heading })).toBeVisible();
  }

  await page.goto("/#/accounts");

  const accountField = page
    .locator("[data-page='accounts'] .field-group")
    .filter({ hasText: /Account Name/i })
    .first()
    .locator("input");

  await accountField.fill("Acme Analytics");

  await page.getByRole("link", { name: "Open" }).first().click();
  await expect(page.locator("[data-page='account-detail']")).toBeVisible();
  await page.getByRole("link", { name: "Back to accounts" }).click();
  await expect(page.locator("[data-page='accounts']")).toBeVisible();

  await page.goto("/#/accounts/not-a-real-account");
  await page.waitForURL(/#\/accounts$/);
  await expect(page.locator("[data-page='accounts']")).toBeVisible();

  await page.goto("/#/json-export");
  const jsonOutput = page.locator("#json-output");
  await expect(jsonOutput).toHaveValue(/"account_name": "Acme Analytics"/);
});
