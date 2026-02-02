import assert from "node:assert/strict";

import { computeDerived, getDerived } from "../../src/lib/dashboard.js";
import { seedInstances } from "../../src/data/seed-data.js";

const state = {
  instances: JSON.parse(JSON.stringify(seedInstances)),
  derived_values: [],
};

computeDerived(state);

const novaLtvCac = getDerived(state, "client_account", "acct_nova", "ltv_cac_ratio")?.value;
const novaGrossProfit = getDerived(state, "client_account", "acct_nova", "gross_profit")?.value;
const novaPayback = getDerived(state, "client_account", "acct_nova", "cac_payback_months")?.value;

assert.equal(novaLtvCac, 8);
assert.equal(novaGrossProfit, 1320000);
assert.equal(novaPayback, 6.4);

const orbitLtvCac = getDerived(state, "client_account", "acct_orbit", "ltv_cac_ratio")?.value;
const orbitPayback = getDerived(state, "client_account", "acct_orbit", "cac_payback_months")?.value;

assert.equal(orbitLtvCac, 7.69);
assert.equal(orbitPayback, 6.7);

console.log("roi derivation unit tests passed");
