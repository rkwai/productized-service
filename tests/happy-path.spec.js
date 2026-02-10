import { test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadFeature } from "./bdd/gherkin.js";
import { runFeature } from "./bdd/runner.js";
import { stepDefinitions } from "./bdd/steps.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const feature = loadFeature(join(currentDir, "features/happy-path.feature"));

runFeature(test, feature, stepDefinitions);
