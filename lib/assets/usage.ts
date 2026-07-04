import fs from "fs/promises";
import path from "path";
import { StorySchema } from "@/lib/schemas/story";
import type { Scene } from "@/types";

const STORIES_DIR = path.join(process.cwd(), "stories");

/** Legacy background ID mapping from early scene migration. */
const LEGACY_BACKGROUND_IDS: Record<string, string> = {
  "leo-bedroom": "bedroom",
  "leo-bedroom-spaceship": "bedroom",
  "hallway-door": "hallway",
};

function collectSceneAssetIds(scene: Scene, counts: Map<string, number>): void {
  const bgId = LEGACY_BACKGROUND_IDS[scene.background] ?? scene.background;
  counts.set(bgId, (counts.get(bgId) ?? 0) + 1);

  for (const character of scene.characters) {
    counts.set(character.character, (counts.get(character.character) ?? 0) + 1);
  }

  for (const layer of [
    ...scene.props,
    ...scene.objects,
    ...scene.speechBubbles,
    ...scene.effects,
  ]) {
    const assetId = "assetId" in layer ? layer.assetId : (layer as { asset?: { id: string } }).asset?.id;
    if (assetId) {
      counts.set(assetId, (counts.get(assetId) ?? 0) + 1);
    }
  }
}

/** Scan all story JSON files and count asset ID references. */
export async function computeAssetUsageCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  let bookDirs: string[];
  try {
    const entries = await fs.readdir(STORIES_DIR, { withFileTypes: true });
    bookDirs = entries.filter((e) => e.isDirectory() && e.name.startsWith("book")).map((e) => e.name);
  } catch {
    return counts;
  }

  for (const bookDir of bookDirs) {
    const storyPath = path.join(STORIES_DIR, bookDir, "story.json");
    try {
      const raw = await fs.readFile(storyPath, "utf-8");
      const story = StorySchema.parse(JSON.parse(raw));

      for (const page of story.pages) {
        if (page.scene) {
          collectSceneAssetIds(page.scene, counts);
        }
      }
    } catch {
      // Skip books without valid story.json
    }
  }

  return counts;
}

/** Return sorted list of asset IDs used in a single scene (for validation). */
export function getSceneAssetIds(scene: Scene): string[] {
  const ids = new Set<string>();
  ids.add(LEGACY_BACKGROUND_IDS[scene.background] ?? scene.background);

  for (const character of scene.characters) {
    ids.add(character.character);
  }

  for (const layer of [
    ...scene.props,
    ...scene.objects,
    ...scene.speechBubbles,
    ...scene.effects,
  ]) {
    const assetId = "assetId" in layer ? layer.assetId : (layer as { asset?: { id: string } }).asset?.id;
    if (assetId) ids.add(assetId);
  }

  return [...ids];
}
