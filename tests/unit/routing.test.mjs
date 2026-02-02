import assert from "node:assert/strict";

import {
  NAV_ITEMS,
  ROUTES,
  readRouteFromHash,
  resolveActivePage,
  toHashHref,
} from "../../src/lib/routing.mjs";

const navPaths = NAV_ITEMS.map((item) => item.path);
assert.deepEqual(navPaths, ROUTES);

assert.deepEqual(readRouteFromHash("#/portfolio/client_account/acc_123"), {
  page: "portfolio",
  objectType: "client_account",
  objectId: "acc_123",
});

assert.deepEqual(readRouteFromHash("http://localhost:5173/#/portfolio/client_account/acct_nova"), {
  page: "portfolio",
  objectType: "client_account",
  objectId: "acct_nova",
});

assert.deepEqual(readRouteFromHash("#/portfolio/client_account/acct%20nova"), {
  page: "portfolio",
  objectType: "client_account",
  objectId: "acct nova",
});

assert.equal(
  toHashHref({ page: "portfolio", objectType: "client_account", objectId: "acct nova" }),
  "#/portfolio/client_account/acct%20nova"
);

assert.equal(
  resolveActivePage({
    route: { page: "portfolio", objectType: "client_account", objectId: "acc_123" },
    accountDetail: { account_id: "acc_123" },
  }),
  "portfolio"
);

console.log("routing unit tests passed");
