# Art Style Guide — Leo & Pip Comic

Reference: ZOOMIE and supplied comic panels.

## Visual principles

- **Clean comic-book outlines** — `#2C1810`, 2–3px stroke
- **Warm, soft palette** — cream backgrounds, never harsh whites
- **Soft cell shading** — shadow layer offset behind fill shapes
- **Large expressive eyes** — white sclera, small pupils, optional highlight dot
- **Minimal clutter** — one clear focal point per panel
- **Safe and friendly** — Pixar-level emotional readability

## Characters

### Leo (7)
- Messy brown hair (`#6B4423`)
- Green hoodie (`#5CB85C`) — signature look from reference
- Blue jeans, brown shoes
- Warm skin tone (`#F4C9A0`)
- Never drawn as naughty — curious, trying his best

### Pip
- Round fluffy blue body (`#6EB5E0`) with lighter fluff highlights
- Two antennae on top
- Huge expressive eyes
- Tiny yellow backpack (`#F5C842`) — always present
- Represents curiosity, never blame

## Technical implementation

| Asset type | Location |
|------------|----------|
| Shared palette | `lib/art/style.ts` |
| Character SVGs | `components/characters/` |
| Story panels | `public/stories/bookNN/illustrations/` |
| Panel frame UI | `comicPanelClass` on `StoryIllustration` |
| Caption text | `StoryText` — rounded caption box |

## Adding new illustrations

1. Use palette from `lib/art/style.ts`
2. Export as SVG, 400×500 (portrait panel) or 400×300 (landscape activity)
3. Include floor line (`#D4C4A8`) and cream wall where appropriate
4. Outline all shapes — no fill-only elements
5. Place in `public/stories/bookNN/illustrations/`
6. Reference in `story.json` — never embed in components

## Future: ZOOMIE story

The reference comic ("time blindness / zoomie") can become `book02` using the same style system and JSON schemas.
