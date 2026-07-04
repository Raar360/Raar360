# CreatorBible

Canonical world definitions for Pip's Backpack. This is **not** user-facing documentation — it is the single source of truth for every future illustration and story.

## Structure

| Path | Purpose |
|------|---------|
| `Characters/` | Leo, Pip, Dad, Mum, Whiskers — appearance, poses, rules |
| `World/` | Locations, environment, scale |
| `IllustrationRules.md` | Scene composition, layer ordering, asset categories |
| `StoryRules.md` | Narrative constraints and story structure |
| `Canon/` | Core principles and colour palette |
| `Objects/` | Story object inventory |

## Asset Registry

All visuals are registered in `assets/registry.json` at the repository root. Scenes reference **asset IDs only** — never file paths.

Run `npm run assets:sync-usage` to update usage counts from published stories.

## Gold standard

Book 01 (*The Tiny Green Brick*) is the reference implementation. All future books follow its scene structure and CreatorBible rules.
