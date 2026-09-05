import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const versionFiles = [
  "apps/preset-mutator-pro/public/index.html",
  "apps/preset-mutator-pro/public/audio/index.html",
  "apps/preset-mutator-pro/public/mutate/index.html",
];
const companionFiles = [
  "apps/preset-mutator-pro/public/changelog/index.html",
  "scripts/check-preset-mutator-pro.mjs",
];

function stagedProAppChanged() {
  const stagedFiles = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
    cwd: rootDir,
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);

  return stagedFiles.some(
    (file) => file.startsWith("apps/preset-mutator-pro/public/") && !file.startsWith("apps/preset-mutator-pro/public/changelog/"),
  );
}

function stagedVersionChanged() {
  const diff = execFileSync("git", ["diff", "--cached", "--unified=0", "--", ...versionFiles], {
    cwd: rootDir,
    encoding: "utf8",
  });

  return /^[-+](?![-+]).*Preset Mutator Pro v\d+\.\d+\.\d+/m.test(diff);
}

function nextPatchVersion(version) {
  const match = /^v(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Unsupported Preset Mutator Pro version: ${version}`);
  }

  const [, major, minor, patch] = match;
  return `v${major}.${minor}.${Number(patch) + 1}`;
}

async function bumpVersion() {
  const fileContents = await Promise.all(
    versionFiles.map(async (file) => ({
      file,
      content: await readFile(path.join(rootDir, file), "utf8"),
    })),
  );
  const versions = new Set(
    fileContents.flatMap(({ content }) => [...content.matchAll(/v\d+\.\d+\.\d+/g)].map(([version]) => version)),
  );

  if (versions.size !== 1) {
    throw new Error(`Preset Mutator Pro version files are out of sync: ${[...versions].join(", ") || "none found"}`);
  }

  const [currentVersion] = versions;
  const nextVersion = nextPatchVersion(currentVersion);

  await Promise.all(
    fileContents.map(({ file, content }) =>
      writeFile(path.join(rootDir, file), content.split(currentVersion).join(nextVersion)),
    ),
  );
  await Promise.all(
    companionFiles.map(async (file) => {
      const content = await readFile(path.join(rootDir, file), "utf8");
      await writeFile(path.join(rootDir, file), content.split(currentVersion).join(nextVersion));
    }),
  );
  execFileSync("git", ["add", "--", ...versionFiles, ...companionFiles], { cwd: rootDir, stdio: "inherit" });
  console.log(`Preset Mutator Pro version: ${currentVersion} -> ${nextVersion}`);
}

if (!process.argv.includes("--staged") || (stagedProAppChanged() && !stagedVersionChanged())) {
  await bumpVersion();
}
