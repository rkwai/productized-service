import assert from "node:assert/strict";

import {
  buildAliasLookup,
  coerceRecordValues,
  mapRecordToSchema,
  normalizeKey,
  parseCsvText,
  parseImportText,
} from "../../src/lib/importer.js";
import { initialData } from "../../src/data/initial-data.js";

const leadType = initialData.semantic_layer.object_types.find((type) => type.id === "lead");

const csvSample =
  "lead_id,company_name,expected_value\nlead_1,\"Acme, Inc\",$12500\nlead_2,Northwind,40000\n";
const parsedCsv = parseCsvText(csvSample);
assert.equal(parsedCsv.records.length, 2);
assert.equal(parsedCsv.records[0].company_name, "Acme, Inc");

const parsedJson = parseImportText('[{"lead_id":"lead_3","company_name":"Beta"}]');
assert.equal(parsedJson.format, "json");
assert.equal(parsedJson.records.length, 1);

const aliasLookup = buildAliasLookup(leadType, { company_name: ["company"], expected_value: ["value"] });
const { mapped, unknownKeys } = mapRecordToSchema(
  { company: "Northwind", value: "$4,500", extra: "ignore" },
  aliasLookup
);
assert.equal(mapped.company_name, "Northwind");
assert.deepEqual(unknownKeys, ["extra"]);

const coerced = coerceRecordValues({ expected_value: "$4,500", company_name: "Northwind" }, leadType);
assert.equal(coerced.expected_value, 4500);

assert.equal(normalizeKey("Company Name"), "company_name");

console.log("importer unit tests passed");
