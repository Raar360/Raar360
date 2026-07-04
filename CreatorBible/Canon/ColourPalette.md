# Colour Palette

## Source of Truth

Programmatic tokens live in `lib/art/style.ts` as `comicArt`. All SVG assets and React components must use these values.

## Core Palette

| Token | Hex | Use |
|-------|-----|-----|
| `outline` | `#2C1810` | All comic outlines, pupils |
| `outlineWidth` | `2.5px` | Standard stroke width |
| `cream` | `#FAF3E8` | Backgrounds, walls |
| `creamShadow` | `#EDE0CE` | Subtle depth |
| `floor` | `#D4C4A8` | Floor boards |
| `wall` | `#E8DFD0` | Wall areas below ceiling |

## Character Colours

### Leo

| Token | Hex | Use |
|-------|-----|-----|
| `skin` | `#F4C9A0` | Face, hands |
| `skinShadow` | `#E5B088` | Shading |
| `hair` | `#6B4423` | Hair |
| `hairHighlight` | `#8B5E34` | Hair shine |
| `leoHoodie` | `#5CB85C` | Hoodie — signature |
| `leoHoodieShadow` | `#449944` | Hoodie shading |
| `leoJeans` | `#4A7FC1` | Jeans |
| `leoJeansShadow` | `#35629E` | Jeans shading |
| `leoShoes` | `#8B5E3C` | Shoes |

### Pip

| Token | Hex | Use |
|-------|-----|-----|
| `pipBody` | `#6EB5E0` | Main body |
| `pipBodyShadow` | `#4A95C4` | Shading |
| `pipFluff` | `#8ECAE6` | Cheek fluff, antenna tips |
| `pipBackpack` | `#F5C842` | Backpack — always present |
| `pipBackpackShadow` | `#D4A817` | Backpack shading |

## Object Colours

| Token | Hex | Use |
|-------|-----|-----|
| `brickGreen` | `#6BB86B` | Green brick |
| `brickShadow` | `#4E9A4E` | Green brick shadow |

## Accent Colours

| Token | Hex | Use |
|-------|-----|-----|
| `blush` | `#E8A598` | Warm accents |
| `blushGlow` | `#F5C4BC` | Soft highlights |

## UI Design Tokens (CSS)

| Token | Hex | Use |
|-------|-----|-----|
| `--color-cream` | `#FAF3E8` | App background |
| `--color-warm-brown` | `#5C4033` | Body text |
| `--color-soft-blue` | `#7EB8DA` | Pip accent |
| `--color-golden` | `#F4C542` | Backpack accent |
| `--color-outline` | `#3D2914` | UI borders |

## Rules

- Never use pure white `#FFFFFF` for backgrounds — use `cream`
- Never use pure black — use `outline`
- All fills must have matching outline strokes
- Shadow layers sit behind fill layers, offset 2–3 px
