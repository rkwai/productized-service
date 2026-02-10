import { expect } from "@playwright/test";

const pageMap = {
  Customers: { selector: '[data-page="portfolio"]', heading: "Profitability by segment" },
  Leads: { selector: '[data-page="leads"]' },
  "Activation Health": { selector: '[data-page="engagement-health"]' },
  Settings: { selector: '[data-page="admin"]' },
  Home: { selector: '[data-page="home"]' },
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const openPage = async (page, name) => {
  const config = pageMap[name];
  if (!config) {
    throw new Error(`Unknown page "${name}" in step definition.`);
  }
  await page.getByRole("link", { name }).click();
  await expect(page.locator(config.selector)).toBeVisible();
};

const getCustomersPanel = (page) =>
  page.getByRole("heading", { level: 3, name: "Customers" }).locator("..");

const getLeadsPanel = (page) =>
  page.getByRole("heading", { level: 3, name: "Lead pipeline" }).locator("..");

const getCompanyNameField = (page) =>
  page
    .locator("[data-page='admin'] .field-group")
    .filter({ hasText: /company name/i })
    .first()
    .locator("input");

export const stepDefinitions = [
  {
    pattern: /^I open the app$/,
    action: async ({ page }) => {
      await page.goto("/");
    },
  },
  {
    pattern: /^I see the global navigation$/,
    action: async ({ page }) => {
      await expect(page.getByRole("navigation")).toBeVisible();
    },
  },
  {
    pattern: /^I am on the Home page$/,
    action: async ({ page }) => {
      await expect(page.locator(pageMap.Home.selector)).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 2, name: "Home / Owner Summary" })
      ).toBeVisible();
    },
  },
  {
    pattern: /^I see the home KPI "([^"]+)"$/,
    action: async ({ page }, kpiLabel) => {
      await expect(
        page.locator(`${pageMap.Home.selector} .kpi-group`).first().getByText(kpiLabel)
      ).toBeVisible();
    },
  },
  {
    pattern: /^I see the "([^"]+)" note$/,
    action: async ({ page }, noteText) => {
      await expect(page.getByText(noteText)).toBeVisible();
    },
  },
  {
    pattern: /^I open the (.+) page$/,
    action: async ({ page }, pageName) => {
      await openPage(page, pageName);
    },
  },
  {
    pattern: /^I see the segment profitability summary$/,
    action: async ({ page }) => {
      await expect(page.getByRole("heading", { name: pageMap.Customers.heading })).toBeVisible();
    },
  },
  {
    pattern: /^I expand the first customer row$/,
    action: async ({ page }) => {
      const customersPanel = getCustomersPanel(page);
      const firstAccountRow = customersPanel.locator("table tbody tr").first();
      await firstAccountRow.locator("td").nth(1).click();
      await expect(customersPanel.locator(".object-panel")).toBeVisible();
    },
  },
  {
    pattern: /^I expand the first lead row$/,
    action: async ({ page }) => {
      const leadsPanel = getLeadsPanel(page);
      const firstLeadRow = leadsPanel.locator("table tbody tr").first();
      await firstLeadRow.locator("td").first().click();
      await expect(leadsPanel.locator(".object-panel")).toBeVisible();
    },
  },
  {
    pattern: /^I see the Activation Health page$/,
    action: async ({ page }) => {
      await expect(page.locator(pageMap["Activation Health"].selector)).toBeVisible();
    },
  },
  {
    pattern: /^I update the company name to "([^"]+)"$/,
    action: async ({ page }, companyName) => {
      const companyNameField = getCompanyNameField(page);
      await companyNameField.fill(companyName);
    },
  },
  {
    pattern: /^I see the JSON output includes company name "([^"]+)"$/,
    action: async ({ page }, companyName) => {
      const jsonOutput = page.locator("#json-output");
      const escapedName = escapeRegExp(companyName);
      await expect(jsonOutput).toHaveValue(
        new RegExp(`"company_name":\\s*"${escapedName}"`)
      );
    },
  },
];
