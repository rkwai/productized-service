import { test } from "@playwright/test";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadFeature } from "./bdd/gherkin.js";
import { runFeature } from "./bdd/runner.js";
import { stepDefinitions } from "./bdd/steps.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const featuresDir = join(currentDir, "features");
const featureFiles = fs
  .readdirSync(featuresDir)
  .filter((file) => file.endsWith(".feature"))
  .sort();

if (!featureFiles.length) {
  throw new Error("No Gherkin feature files found in tests/features.");
}

featureFiles.forEach((file) => {
  const feature = loadFeature(join(featuresDir, file));
  runFeature(test, feature, stepDefinitions);
});
