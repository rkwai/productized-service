import fs from "node:fs";
import { fileURLToPath } from "node:url";

const STEP_KEYWORDS = ["Given", "When", "Then", "And", "But"];

const normalizePath = (inputPath) => {
  if (inputPath instanceof URL) {
    return fileURLToPath(inputPath);
  }
  return inputPath;
};

export const loadFeature = (inputPath) => {
  const filePath = normalizePath(inputPath);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  let featureName = "";
  const scenarios = [];
  const backgroundSteps = [];
  let activeScenario = null;
  let inBackground = false;

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      return;
    }

    if (line.startsWith("Feature:")) {
      featureName = line.slice("Feature:".length).trim();
      return;
    }

    if (line.startsWith("Background:")) {
      inBackground = true;
      activeScenario = null;
      return;
    }

    if (line.startsWith("Scenario:")) {
      inBackground = false;
      activeScenario = {
        name: line.slice("Scenario:".length).trim(),
        steps: [...backgroundSteps],
      };
      scenarios.push(activeScenario);
      return;
    }

    const keyword = STEP_KEYWORDS.find((step) => line.startsWith(`${step} `));
    if (keyword) {
      const text = line.slice(keyword.length).trim();
      const step = { keyword, text, line: index + 1 };
      if (inBackground) {
        backgroundSteps.push(step);
        return;
      }
      if (!activeScenario) {
        throw new Error(`Step found before a Scenario at line ${index + 1}.`);
      }
      activeScenario.steps.push(step);
    }
  });

  if (!featureName) {
    featureName = filePath;
  }

  if (!scenarios.length) {
    throw new Error(`No scenarios found in ${filePath}.`);
  }

  return { name: featureName, scenarios };
};
