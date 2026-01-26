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

assert.deepEqual(readRouteFromHash("#/accounts/acc_123"), {
  page: "accounts",
  id: "acc_123",
});

assert.deepEqual(readRouteFromHash("http://localhost:5173/#/accounts/acct_nova"), {
  page: "accounts",
  id: "acct_nova",
});

assert.deepEqual(readRouteFromHash("#/accounts/acct%20nova"), {
  page: "accounts",
  id: "acct nova",
});

assert.equal(readRouteFromHash("#/not-a-page").page, "overview");

assert.equal(toHashHref({ page: "accounts", id: "acct nova" }), "#/accounts/acct%20nova");
assert.equal(toHashHref({ page: "not-a-page" }), "#/overview");

assert.equal(
  resolveActivePage({
    route: { page: "accounts", id: "acc_123" },
    accountDetail: { account_id: "acc_123" },
  }),
  "account-detail"
);

assert.equal(
  resolveActivePage({
    route: { page: "accounts", id: "missing" },
    accountDetail: null,
  }),
  "accounts"
);

console.log("routing unit tests passed");
