import { cp, mkdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const sourceRoot = resolve(process.argv[2] || "");
const destinationRoot = resolve("apps/preset-mutator-pro/public/assets/seeds/vital/velvet-ruins");

if (!process.argv[2]) {
  throw new Error("Usage: node scripts/import-velvet-ruins-seeds.mjs /path/to/Velvet-Ruins/Presets");
}

const templates = [
  "Drones and Pads/KS Burial Bloom.vital",
  "Drones and Pads/KS Haze Reliquary.vital",
  "Drones and Pads/KS Ruin Sleep.vital",
  "Drones and Pads/KS Monolith Haze.vital",
  "Ritual Keys and Plucks/KS Ash Bell Ritual.vital",
  "Ritual Keys and Plucks/KS Sable Dulcimer.vital",
  "Ritual Keys and Plucks/KS Hollow Bellframe.vital",
  "Ritual Keys and Plucks/KS Ritual Ivory.vital",
  "Dark Basses and Low End/KS Crypt Foundation.vital",
  "Dark Basses and Low End/KS Worn Subharmonic.vital",
  "Dark Basses and Low End/KS Mourning Engine.vital",
  "Dark Basses and Low End/KS Black Tonnage.vital",
  "SFX and Textures/KS Sepulcher Glass.vital",
  "SFX and Textures/KS Shard Procession.vital",
  "SFX and Textures/KS Fracture Bloom.vital",
  "SFX and Textures/KS Shard Relay.vital",
];

await mkdir(destinationRoot, { recursive: true });

for (const relativePath of templates) {
  const sourcePath = resolve(sourceRoot, relativePath);
  await stat(sourcePath);
  await cp(sourcePath, resolve(destinationRoot, relativePath.split("/").at(-1)));
}

console.log(`Imported ${templates.length} Velvet Ruins templates into ${destinationRoot}`);
