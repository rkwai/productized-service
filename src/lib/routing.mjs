export const NAV_ITEMS = [
  { path: "home", label: "Home / Executive Summary" },
  { path: "portfolio", label: "Portfolio (Accounts)" },
  { path: "engagement-health", label: "Engagement Health" },
  { path: "delivery-reliability", label: "Delivery Reliability" },
  { path: "value-realization", label: "Value Realization" },
  { path: "risks-change-control", label: "Risks & Change Control" },
  { path: "renewal-collections", label: "Renewal & Collections" },
  { path: "governance", label: "Governance" },
  { path: "action-center", label: "Action Center / Inbox" },
  { path: "ontology-explorer", label: "Ontology Explorer" },
  { path: "admin", label: "Admin / Settings" },
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
