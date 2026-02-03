import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

const unitDirUrl = new URL(".", import.meta.url);
const testFiles = readdirSync(unitDirUrl)
  .filter((file) => file.endsWith(".mjs") && file !== "run.mjs")
  .sort();

let hasFailure = false;

for (const file of testFiles) {
  const fileUrl = new URL(file, unitDirUrl);
  try {
    await import(fileUrl.href);
  } catch (error) {
    hasFailure = true;
    console.error(`Unit test failed: ${file}`);
    console.error(error);
  }
}

if (hasFailure) {
  process.exitCode = 1;
}
