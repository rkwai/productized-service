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

const getImportPanel = (page) =>
  page.getByRole("heading", { level: 3, name: "Lead & deal imports" }).locator("..");

const findFieldInput = (panel, label) => {
  const fieldGroup = panel
    .locator(".field-group")
    .filter({ hasText: new RegExp(escapeRegExp(label), "i") })
    .first();
  return fieldGroup.locator("input, textarea");
};

const coerceInputValue = async (input, value) => {
  const type = await input.getAttribute("type");
  if (type === "datetime-local" && value && !String(value).includes("T")) {
    return `${value}T09:00`;
  }
  return value;
};

const getPriorityFocusPanel = (page) =>
  page.locator(".panel").filter({ has: page.getByRole("heading", { name: "Priority focus" }) });

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
    pattern: /^I see the decision cockpit purpose statement$/,
    action: async ({ page }) => {
      await expect(
        page
          .getByText(/Clarify (the )?next focus across leads, activation, and profitability\./i)
          .first()
      ).toBeVisible();
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
    pattern: /^I see the owner value brief highlights$/,
    action: async ({ page }) => {
      const brief = page.locator(".executive-brief");
      await expect(brief.getByRole("heading", { name: "Owner value brief" })).toBeVisible();
      const tiles = brief.locator(".summary-tile");
      const count = await tiles.count();
      expect(count).toBeGreaterThanOrEqual(3);
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
    pattern: /^I see the priority focus recommendation$/,
    action: async ({ page }) => {
      const homePage = page.locator(pageMap.Home.selector);
      await expect(homePage.getByRole("heading", { name: "Priority focus" })).toBeVisible();
      await expect(homePage.getByText("Focus now")).toBeVisible();
      await expect(homePage.getByText("Suggested next step")).toBeVisible();
    },
  },
  {
    pattern: /^I see the focus value at stake$/,
    action: async ({ page }) => {
      const focusPanel = getPriorityFocusPanel(page);
      await expect(
        focusPanel.locator(".summary-tile").filter({ hasText: "Value at stake" })
      ).toBeVisible();
    },
  },
  {
    pattern: /^I see the "([^"]+)" KPI$/,
    action: async ({ page }, kpiLabel) => {
      await expect(
        page.locator(pageMap.Home.selector).getByText(kpiLabel).first()
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
    pattern: /^I load the CSV import template for leads$/,
    action: async ({ page }) => {
      const importPanel = getImportPanel(page);
      await importPanel.getByRole("button", { name: "Use CSV template" }).click();
      await expect(importPanel.getByText("CSV template loaded.")).toBeVisible();
    },
  },
  {
    pattern: /^I import leads from the template$/,
    action: async ({ page }) => {
      const importPanel = getImportPanel(page);
      await importPanel.getByRole("button", { name: "Import Leads" }).click();
    },
  },
  {
    pattern: /^I see the lead import success message$/,
    action: async ({ page }) => {
      const importPanel = getImportPanel(page);
      await expect(importPanel.getByText(/Imported 1 lead/i)).toBeVisible();
    },
  },
  {
    pattern: /^I see the segment profitability summary$/,
    action: async ({ page }) => {
      await expect(page.getByRole("heading", { name: pageMap.Customers.heading })).toBeVisible();
    },
  },
  {
    pattern: /^I see profit concentration guidance$/,
    action: async ({ page }) => {
      const panel = page.getByRole("heading", { name: pageMap.Customers.heading }).locator("..");
      await expect(
        panel.getByText("Gross profit and LTV:CAC highlight where to concentrate marketing spend.")
      ).toBeVisible();
    },
  },
  {
    pattern: /^I set focus on the most profitable segment$/,
    action: async ({ page }) => {
      const panel = page.getByRole("heading", { name: pageMap.Customers.heading }).locator("..");
      const firstRow = panel.locator("table tbody tr").first();
      await firstRow.getByRole("button", { name: "Set focus" }).click();
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
    pattern: /^I update the customer field "([^"]+)" to "([^"]+)"$/,
    action: async ({ page }, fieldLabel, fieldValue) => {
      const customersPanel = getCustomersPanel(page);
      const objectPanel = customersPanel.locator(".object-panel");
      if (!(await objectPanel.isVisible())) {
        const firstAccountRow = customersPanel.locator("table tbody tr").first();
        await firstAccountRow.locator("td").nth(1).click();
        await expect(objectPanel).toBeVisible();
      }
      const input = findFieldInput(customersPanel, fieldLabel);
      const normalizedValue = await coerceInputValue(input, fieldValue);
      await input.fill(normalizedValue);
    },
  },
  {
    pattern: /^I see the customer field "([^"]+)" value "([^"]+)"$/,
    action: async ({ page }, fieldLabel, fieldValue) => {
      const customersPanel = getCustomersPanel(page);
      const input = findFieldInput(customersPanel, fieldLabel);
      await expect(input).toHaveValue(fieldValue);
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
    pattern: /^I update the lead field "([^"]+)" to "([^"]+)"$/,
    action: async ({ page }, fieldLabel, fieldValue) => {
      const leadsPanel = getLeadsPanel(page);
      const input = findFieldInput(leadsPanel, fieldLabel);
      const normalizedValue = await coerceInputValue(input, fieldValue);
      await input.fill(normalizedValue);
    },
  },
  {
    pattern: /^I create a deal from the lead$/,
    action: async ({ page }) => {
      const leadsPanel = getLeadsPanel(page);
      const firstRow = leadsPanel.locator("table tbody tr").first();
      await firstRow.getByRole("button", { name: /Create deal|View deal/i }).click();
      await expect(page.locator('[data-page="deals"]')).toBeVisible();
    },
  },
  {
    pattern: /^I see the lead field "([^"]+)" value "([^"]+)"$/,
    action: async ({ page }, fieldLabel, fieldValue) => {
      const leadsPanel = getLeadsPanel(page);
      const input = findFieldInput(leadsPanel, fieldLabel);
      await expect(input).toHaveValue(fieldValue);
    },
  },
  {
    pattern: /^I see the Activation Health page$/,
    action: async ({ page }) => {
      await expect(page.locator(pageMap["Activation Health"].selector)).toBeVisible();
    },
  },
  {
    pattern: /^I see activation completion rate$/,
    action: async ({ page }) => {
      const pageScope = page.locator(pageMap["Activation Health"].selector);
      await expect(pageScope.getByText("Completion Rate")).toBeVisible();
    },
  },
  {
    pattern: /^I see the next renewal date$/,
    action: async ({ page }) => {
      const pageScope = page.locator(pageMap["Activation Health"].selector);
      await expect(pageScope.getByText("Next Renewal Date")).toBeVisible();
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
  {
    pattern: /^I see the lead pipeline updated$/,
    action: async ({ page }) => {
      const leadsPage = page.locator(pageMap.Leads.selector);
      await expect(
        leadsPage.locator("table tbody tr").filter({ hasText: "Northwind Labs" })
      ).toBeVisible();
    },
  },
];
