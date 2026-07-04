# Canon

The CreatorBible canon is the authoritative definition of the Leo & Pip world. Every asset, scene, and story must conform to these rules.

## Core principles

1. **Recognition, not teaching** — stories help children feel seen, not instructed
2. **Leo is never naughty** — curious, absorbed, trying his best
3. **Pip is never blame** — wonder and curiosity only
4. **Adults are warm** — Dad and Mum never scold, diagnose, or lecture
5. **Asset reuse** — every visual element lives in the Asset Registry

## Canon files

| File | Purpose |
|------|---------|
| `ColourPalette.md` | All approved colours — mirrors `lib/art/style.ts` |
| `../Characters/` | Character appearance, poses, personality |
| `../World/` | Locations and environment |
| `../Objects/` | Story object inventory |
| `../IllustrationRules.md` | Scene composition |
| `../StoryRules.md` | Narrative constraints |

## Asset Registry

All visuals are registered in `assets/registry.json` with:

- ID, name, category, tags
- Dimensions and file path
- Usage count (computed from published stories)

Scenes reference **asset IDs only** — never file paths or image URLs.

## Book 01 gold standard

`book01` (The Tiny Green Brick) is the reference implementation. All future books follow its scene structure, asset usage patterns, and CreatorBible rules.
