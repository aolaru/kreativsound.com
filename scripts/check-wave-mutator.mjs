import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "apps/wave-mutator/public");
const requiredFiles = ["index.html", "styles.css", "app.js", "vendor/lame.min.js"];
const errors = [];

function fail(message) {
  errors.push(message);
}

for (const file of requiredFiles) {
  if (!existsSync(path.join(sourceDir, file))) {
    fail(`Missing Wave Mutator source file: ${file}`);
  }
}

if (!errors.length) {
  const html = readFileSync(path.join(sourceDir, "index.html"), "utf8");
  const app = readFileSync(path.join(sourceDir, "app.js"), "utf8");

  if (!html.includes("Wave Mutator")) {
    fail("Wave Mutator HTML should identify the tool by name.");
  }
  if (!html.includes("./styles.css") || !html.includes("./app.js")) {
    fail("Wave Mutator HTML should load local styles.css and app.js.");
  }
  if (!html.includes("./vendor/lame.min.js")) {
    fail("Wave Mutator HTML should load the bundled local MP3 encoder.");
  }
  if (!app.includes("Wave Mutator") && !app.includes("wave")) {
    fail("Wave Mutator app source does not look like the expected tool script.");
  }
  for (const expectedFeature of [
    "encodeBufferAsMp3",
    "findTrimBounds",
    "renderPreflight",
    "cancelBatch",
    "createManifestText",
    "MAX_QUEUE_FILES",
  ]) {
    if (!app.includes(expectedFeature)) {
      fail(`Wave Mutator app is missing expected release feature: ${expectedFeature}.`);
    }
  }
  const lame = readFileSync(path.join(sourceDir, "vendor/lame.min.js"), "utf8");
  if (!lame.includes("Mp3Encoder")) {
    fail("Bundled MP3 encoder does not expose Mp3Encoder.");
  }

  const syntax = spawnSync(process.execPath, ["--check", path.join(sourceDir, "app.js")], {
    cwd: rootDir,
    encoding: "utf8",
  });
  if (syntax.status !== 0) {
    fail(`Wave Mutator app.js syntax check failed:\n${syntax.stderr || syntax.stdout}`);
  }
}

if (errors.length) {
  console.error(`Wave Mutator validation failed: ${errors.length}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Wave Mutator validation passed.");
