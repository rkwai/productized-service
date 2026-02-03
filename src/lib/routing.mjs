export const NAV_ITEMS = [
  { path: "home", label: "Home / Owner Summary" },
  { path: "leads", label: "Leads" },
  { path: "deals", label: "Deals" },
  { path: "portfolio", label: "Customers" },
  { path: "engagement-health", label: "Activation Health" },
  { path: "delivery-reliability", label: "Activation Milestones" },
  { path: "value-realization", label: "Profitability Insights" },
  { path: "risks-change-control", label: "Retention & Risks" },
  { path: "renewal-collections", label: "Revenue & Retention" },
  { path: "governance", label: "Operations" },
  { path: "action-center", label: "Next Steps / Inbox" },
  { path: "ontology-explorer", label: "Data Model" },
  { path: "admin", label: "Settings" },
];

export const ROUTES = NAV_ITEMS.map((item) => item.path);

const DEFAULT_ROUTE = "home";

export const readRouteFromHash = (hashValue) => {
  const fallback = `#/${DEFAULT_ROUTE}`;
  const raw = hashValue || window.location.hash || fallback;
  const hashIndex = raw.indexOf("#");
  const hash = hashIndex >= 0 ? raw.slice(hashIndex) : raw;
  const stripped = hash.replace(/^#/, "").replace(/^\/+/, "");
  const [page, objectType, objectId] = stripped.split("/");
  const normalizedPage = ROUTES.includes(page) ? page : DEFAULT_ROUTE;
  return {
    page: normalizedPage,
    objectType: objectType ? decodeURIComponent(objectType) : undefined,
    objectId: objectId ? decodeURIComponent(objectId) : undefined,
  };
};

export const toHashHref = ({ page, objectType, objectId }) => {
  const normalizedPage = ROUTES.includes(page) ? page : DEFAULT_ROUTE;
  const parts = [normalizedPage];
  if (objectType) parts.push(encodeURIComponent(objectType));
  if (objectId) parts.push(encodeURIComponent(objectId));
  return `#/${parts.join("/")}`;
};

export const resolveActivePage = ({ route }) => route.page;
