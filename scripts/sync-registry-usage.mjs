#!/usr/bin/env node
/**
 * Writes computed usage counts from published stories into assets/registry.json.
 * Usage counts are also computed at runtime by the API — this script persists them for authoring.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "assets", "registry.json");
const STORIES_DIR = path.join(ROOT, "stories");

const LEGACY_BG = {
  "leo-bedroom": "bedroom",
  "leo-bedroom-spaceship": "bedroom",
  "hallway-door": "hallway",
};

function collectScene(scene, counts) {
  const bg = LEGACY_BG[scene.background] ?? scene.background;
  counts[bg] = (counts[bg] ?? 0) + 1;
  for (const c of scene.characters ?? []) {
    counts[c.character] = (counts[c.character] ?? 0) + 1;
  }
  for (const key of ["props", "objects", "speechBubbles", "effects"]) {
    for (const layer of scene[key] ?? []) {
      const id = layer.assetId ?? layer.asset?.id;
      if (id) counts[id] = (counts[id] ?? 0) + 1;
    }
  }
}

async function main() {
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, "utf-8"));
  const counts = {};

  const entries = await fs.readdir(STORIES_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("book")) continue;
    const storyPath = path.join(STORIES_DIR, entry.name, "story.json");
    try {
      const story = JSON.parse(await fs.readFile(storyPath, "utf-8"));
      for (const page of story.pages ?? []) {
        if (page.scene) collectScene(page.scene, counts);
      }
    } catch {
      // skip
    }
  }

  registry.assets = registry.assets.map((asset) => ({
    ...asset,
    usageCount: counts[asset.id] ?? 0,
  }));

  await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
  console.log("Updated usage counts in assets/registry.json");
  for (const [id, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    if (count > 0) console.log(`  ${id}: ${count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
