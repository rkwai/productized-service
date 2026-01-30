const { test, expect } = require("@playwright/test");

test("navigation links and admin metadata update work", async ({ page }) => {
  await page.goto("/");

  const navExpectations = [
    { label: "Home / Executive Summary", heading: "Home / Executive Summary", page: "home" },
    { label: "Portfolio (Accounts)", heading: "Portfolio (Accounts)", page: "portfolio" },
    { label: "Engagement Health", heading: "Engagement Health", page: "engagement-health" },
    { label: "Delivery Reliability", heading: "Delivery Reliability", page: "delivery-reliability" },
    { label: "Value Realization", heading: "Value Realization", page: "value-realization" },
    { label: "Risks & Change Control", heading: "Risks & Change Control", page: "risks-change-control" },
    { label: "Renewal & Collections", heading: "Renewal & Collections", page: "renewal-collections" },
    { label: "Governance", heading: "Governance", page: "governance" },
    { label: "Action Center / Inbox", heading: "Action Center / Inbox", page: "action-center" },
    { label: "Ontology Explorer", heading: "Ontology Explorer", page: "ontology-explorer" },
    { label: "Admin / Settings", heading: "Admin / Settings", page: "admin" },
  ];

  for (const item of navExpectations) {
    await page.getByRole("link", { name: item.label }).click();
    await expect(page.locator(`[data-page="${item.page}"]`)).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: item.heading })).toBeVisible();
  }

  await page.goto("/#/admin");

  const companyNameField = page
    .locator("[data-page='admin'] .field-group")
    .filter({ hasText: /company name/i })
    .first()
    .locator("input");

  await companyNameField.fill("Acme Analytics");

  const jsonOutput = page.locator("#json-output");
  await expect(jsonOutput).toHaveValue(/"company_name": "Acme Analytics"/);
});
