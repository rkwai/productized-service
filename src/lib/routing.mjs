export const NAV_ITEMS = [
  { path: "overview", label: "Executive Overview" },
  { path: "accounts", label: "Accounts" },
  { path: "engagements", label: "Engagements" },
  { path: "outcomes", label: "Outcomes & KPIs" },
  { path: "risks", label: "Risks & Issues" },
  { path: "actions", label: "Action Center" },
  { path: "ontology", label: "Ontology Studio" },
  { path: "data-integration", label: "Data Integration" },
  { path: "audit", label: "Audit & Activity" },
  { path: "json-export", label: "JSON Export" },
];

export const ROUTES = NAV_ITEMS.map((item) => item.path);

const DEFAULT_ROUTE = "overview";

export const readRouteFromHash = (hashValue) => {
  const fallback = `#/${DEFAULT_ROUTE}`;
  const raw = hashValue || window.location.hash || fallback;
  const hashIndex = raw.indexOf("#");
  const hash = hashIndex >= 0 ? raw.slice(hashIndex) : raw;
  const stripped = hash.replace(/^#/, "").replace(/^\/+/, "");
  const [page, id] = stripped.split("/");
  const normalizedPage = ROUTES.includes(page) ? page : DEFAULT_ROUTE;
  return { page: normalizedPage, id: id ? decodeURIComponent(id) : undefined };
};

export const toHashHref = ({ page, id }) => {
  const normalizedPage = ROUTES.includes(page) ? page : DEFAULT_ROUTE;
  const parts = [normalizedPage];
  if (id) parts.push(encodeURIComponent(id));
  return `#/${parts.join("/")}`;
};

export const resolveActivePage = ({ route, accountDetail }) => {
  if (route.page === "accounts" && route.id) {
    return accountDetail ? "account-detail" : "accounts";
  }
  return route.page;
};
