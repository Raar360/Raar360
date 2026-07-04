# Illustration Rules

## Philosophy

Scenes are composed from reusable assets — never one-off baked illustrations. Every visual element should exist in the Asset Library so future stories and animations can reuse it.

## Scene Composition

Each scene layer is ordered bottom to top:

```
1. Background
2. Objects (story objects on floor/surfaces)
3. Props (furniture, boxes, spaceship parts)
4. Characters
5. Speech bubbles
6. Effects
```

## Asset Categories

| Category | Examples | Format |
|----------|----------|--------|
| Characters | Leo, Pip, Dad, Mum, Whiskers | React SVG components + pose variants |
| Backgrounds | Hallway, Leo's bedroom | SVG `#FAF3E8` + floor line |
| Props | Cardboard box, spaceship, bricks pile | SVG |
| Objects | Green brick, radio, volcano | SVG (also used on backpack grid) |
| Speech bubbles | Shout, whisper, thought | SVG with optional text |
| Effects | Sparkle, giggle lines, zoomie text | SVG (animated in future) |

## Panel Specifications

| Property | Value |
|----------|-------|
| Aspect ratio | 4:5 portrait |
| Base size | 400 × 500 px |
| Activity panels | 400 × 300 landscape |
| Outline | `#2C1810`, 2–3 px stroke on all shapes |
| Frame | `comicPanelClass` — rounded border, gentle shadow |

## Position Presets

| Preset | X (% of panel width) | Use for |
|--------|------------------------|---------|
| `far-left` | 12 | Characters at edge |
| `left` | 28 | Primary character left |
| `center` | 50 | Centered objects |
| `right` | 72 | Primary character right |
| `far-right` | 88 | Characters at edge |

Y position defaults to 72% (standing on floor line at 80%).

## Character Placement Rules

- Leo and Pip face each other when both present
- Pip floats slightly above floor level (y ≈ 65%)
- Dad appears in doorways at y ≈ 55%
- Whiskers sits on floor at y ≈ 78%

## Colour Source of Truth

All colours must come from `ColourPalette.md` and `lib/art/style.ts`. Never introduce ad-hoc hex values in assets.

## Animation Readiness

Scenes include optional `animation` fields. The Scene Engine resolves animations at render time — **story JSON never changes when animation is added.**

| Animation preset | Future behaviour |
|------------------|------------------|
| `float` | Gentle vertical bob (Pip default) |
| `walk-in` | Character enters from side |
| `sparkle` | Effect layer pulse |
| `peering` | Lean-forward emphasis |

## Migration from Flat Illustrations

Legacy `illustration` paths on story pages are supported as fallback during migration. New content must use `scene` only.

## Authoring Workflow

1. Check CreatorBible for character/world rules
2. Select background from Asset Library (or create + register)
3. Place characters with pose + expression + position
4. Add objects/props/effects as needed
5. Set `dialogue` mode
6. Validate against Zod schemas

## Quality Checklist

- [ ] One clear focal point
- [ ] Floor line present on interior scenes
- [ ] All shapes outlined
- [ ] Pip's yellow backpack visible when Pip is present
- [ ] No harsh whites — use cream palette
- [ ] Large expressive eyes on all characters
