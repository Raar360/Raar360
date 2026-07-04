# Objects

## Story Objects

Story objects are the treasures that appear on Pip's Backpack grid. Each book is represented by one object. Objects may appear as scene layers in their stories.

| Object ID | Label | Book | Visual |
|-----------|-------|------|--------|
| `green-brick` | Green Brick | book01 — The Tiny Green Brick | Small green Lego brick `#6BB86B` |
| `radio` | Radio | (future) | Retro radio |
| `wall` | Wall | (future) | Gentle brick wall |
| `volcano` | Volcano | (future) | Warm volcano |
| `backpack` | Backpack | (future) | Yellow backpack |
| `treasure-map` | Treasure Map | (future) | Rolled map |
| `battery` | Battery | (future) | Soft battery icon |
| `puzzle-piece` | Puzzle Piece | (future) | Single puzzle piece |
| `compass` | Compass | (future) | Friendly compass |

## Green Brick (book01)

| Property | Value |
|----------|-------|
| Asset ID | `green-brick` |
| Registry category | `prop` |
| File path | `props/green-brick.svg` |
| Colour | `#6BB86B`, shadow `#4E9A4E` |
| Size | Tiny — roughly 8×5% of panel |
| Placement | On floor, center or where story specifies |

### Story arc

1. Found on hallway floor (page 03)
2. Used to complete spaceship wing (page 04)
3. Triggers building expansion (pages 05–08)
4. Placed in Pip's backpack at ending (page 12)

## Object Scene Rules

- Objects sit on the floor line unless held by a character
- Objects cast a subtle shadow ellipse beneath them
- Story objects may reappear in Play Together activities

## Adding New Objects

1. Define object here with ID, label, and book mapping
2. Create SVG in `public/assets/objects/`
3. Register in `assets/manifest.json`
4. Add to `StoryObjectType` enum in `lib/schemas/library.ts`
5. Add entry to `stories/library.json`
