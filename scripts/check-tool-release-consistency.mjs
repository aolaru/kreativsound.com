import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const releaseDataPath = path.join(rootDir, "src/data/tool-releases.json");

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function read(relativePath) {
  return readFile(path.join(rootDir, relativePath), "utf8");
}

function currentChangelogEntry(html) {
  return html.match(/<article class="changelog-entry is-current">([\s\S]*?)<\/article>/)?.[1];
}

const surfaces = {
  presetMutatorFree: {
    appPages: [
      "apps/preset-mutator/public/index.html",
      "apps/preset-mutator/public/audio/index.html",
      "apps/preset-mutator/public/mutate/index.html",
    ],
    changelogPage: "apps/preset-mutator/public/changelog/index.html",
    updatesLog: true,
  },
  presetMutatorPro: {
    appPages: [
      "apps/preset-mutator-pro/public/index.html",
      "apps/preset-mutator-pro/public/audio/index.html",
      "apps/preset-mutator-pro/public/mutate/index.html",
    ],
    changelogPage: "apps/preset-mutator-pro/public/changelog/index.html",
    updatesLog: true,
  },
  waveMutator: {
    appPages: ["apps/wave-mutator/public/index.html"],
    updatesLog: true,
  },
  patternMutator: {
    appPages: ["apps/pattern-mutator/public/index.html"],
    changelogPage: "apps/pattern-mutator/public/changelog/index.html",
  },
};

const releases = JSON.parse(await readFile(releaseDataPath, "utf8"));
const [updatesPage, updatesLog, smokeSite, sitemap] = await Promise.all([
  read("src/pages/updates/index.astro"),
  read("src/lib/site-updates.ts"),
  read("scripts/smoke-site.py"),
  read("sitemap.xml"),
]);

assert(!/v\d+\.\d+\.\d+/.test(updatesPage), "Updates page: release versions must come from tool-releases.json, not hard-coded text.");
assert(updatesPage.includes('from "../../lib/tool-releases"'), "Updates page: tool release registry is not imported.");
assert(smokeSite.includes('"tool-releases.json"') && smokeSite.includes("json.loads(TOOL_RELEASES"), "Rendered smoke test: tool release registry is not loaded.");

for (const [key, surface] of Object.entries(surfaces)) {
  const release = releases[key];
  assert(release, `Registry: missing ${key}.`);
  if (!release) continue;

  assert(/^\d+\.\d+\.\d+$/.test(release.version), `Registry: ${key} has an invalid semantic version.`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(release.date), `Registry: ${key} has an invalid release date.`);
  assert(typeof release.name === "string" && release.name.length > 0, `Registry: ${key} has no public name.`);
  assert(typeof release.changelog === "string" && release.changelog.startsWith("/"), `Registry: ${key} has an invalid changelog route.`);

  const version = `v${release.version}`;
  for (const appPage of surface.appPages) {
    const html = await read(appPage);
    const displayedVersions = [...html.matchAll(/v\d+\.\d+\.\d+/g)].map(([value]) => value);
    assert(displayedVersions.includes(version), `${appPage}: expected ${version} from the release registry.`);
    assert(displayedVersions.every((displayedVersion) => displayedVersion === version), `${appPage}: contains a version that conflicts with ${version}.`);
  }

  if (surface.changelogPage) {
    const changelog = await read(surface.changelogPage);
    const entry = currentChangelogEntry(changelog);
    assert(entry, `${surface.changelogPage}: missing current release entry.`);
    assert(entry?.includes(`<h2>${version}</h2>`), `${surface.changelogPage}: current release should be ${version}.`);
    assert(entry?.includes(`<time datetime="${release.date}">`), `${surface.changelogPage}: current release should use ${release.date}.`);
  }

  if (surface.updatesLog) {
    const title = `${release.name}${release.releaseLabel ? ` ${release.releaseLabel}` : ""} ${version}`;
    assert(updatesLog.includes(`date: "${release.date}"`) && updatesLog.includes(`title: "${title}"`) && updatesLog.includes(`href: "${release.changelog}"`), `Updates log: missing the current ${title} release entry.`);
  }

  assert(sitemap.includes(`<loc>https://kreativsound.com${release.changelog}</loc>`), `Sitemap: missing ${release.changelog}.`);
}

for (const key of ["presetMutatorFree", "presetMutatorPro", "waveMutator"]) {
  assert(updatesPage.includes(`toolReleases.${key}`), `Updates page: ${key} card is not registry-backed.`);
}

if (failures.length) {
  console.error(`Tool release consistency check failed: ${failures.length}`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Tool release metadata is consistent across app, changelog, updates, smoke, and sitemap surfaces.");
