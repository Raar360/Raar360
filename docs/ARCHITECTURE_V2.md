# Pip's Backpack — Architecture v2.0

> **Status:** Awaiting approval  
> **Version:** 2.0  
> **Last updated:** 2026-07-04  
> **Supersedes:** [`ARCHITECTURE.md`](ARCHITECTURE.md) v1.0 (upon approval)

**No further implementation should begin until this document is approved.**

---

## Document purpose

This specification reflects a refined direction: **Pixar meets Apple** — premium, calm, magical — with a **layered asset pipeline** (characters over backgrounds, speech bubbles, supplied artwork) rather than flat illustration-per-page.

**Existing work is preserved.** The current prototype (Next.js app, story flow, Book One *The Tiny Green Brick*, Wonder/Play/Pocket, Coach PIN stub, Vercel deployment) remains valuable as **Phase 0**. Upon approval, we **migrate** content and refactor the story renderer — we do not throw away story JSON, copy, or UX patterns already built.

---

## Table of contents

1. [Specification analysis](#1-specification-analysis)
2. [Design principles](#2-design-principles)
3. [Technology stack](#3-technology-stack)
4. [High-level architecture](#4-high-level-architecture)
5. [Folder structure](#5-folder-structure)
6. [Component architecture](#6-component-architecture)
7. [Story JSON schema](#7-story-json-schema)
8. [Illustration & asset organisation](#8-illustration--asset-organisation)
9. [Adding books without code](#9-adding-books-without-code)
10. [Coach Mode](#10-coach-mode)
11. [Story engine (layered pages)](#11-story-engine-layered-pages)
12. [State, offline & PWA](#12-state-offline--pwa)
13. [Migration from v1 prototype](#13-migration-from-v1-prototype)
14. [Development phases (post-approval)](#14-development-phases-post-approval)
15. [Open questions](#15-open-questions)

---

## 1. Specification analysis

### 1.1 What the product is

| Is | Is not |
|----|--------|
| Therapeutic storytelling for self-recognition | An ebook reader |
| A calm, premium experience for child + coach/parent | A game |
| Data-driven, scalable to 100+ books | Hardcoded narratives |
| Object-led discovery (Green Brick, Radio, Volcano…) | “Book 1, Book 2” labels for children |

### 1.2 Core user journeys (unchanged from v1, refined in presentation)

```
Home (magical backpack)
  → Pip's Backpack (objects emerge)
    → Story reader (layered pages)
      → Wonder Together
        → Play Together
          → Pip's Pocket
            → Home

Coach Mode (PIN) → edit / upload / export / duplicate / create
```

### 1.3 Key architectural shift (v1 → v2)

| Area | v1 (built) | v2 (proposed) |
|------|------------|---------------|
| Page rendering | Single full-page illustration + caption text | **Layered scene**: background + character sprites + speech bubbles |
| Art | Placeholder SVGs generated in repo | **Supplied assets** via organised pipeline — no generated artwork |
| Characters | Inline SVG components (Pip, Leo) | **Reusable asset library** with poses/expressions referenced by ID |
| Story JSON | `text` + `illustration` path per page | **Scene graph** per page: layers, bubbles, narration, optional animation |
| Coach Mode | PIN + library list stub | Full CMS-lite: CRUD books, upload assets, duplicate, PDF export |

### 1.4 Non-functional requirements

- **Scalability:** 100+ books; lazy-load assets; catalogue index only at startup
- **Offline:** PWA + precache shell + per-book asset caching on first read
- **Accessibility:** WCAG AA, reduced motion, screen reader support for narration text
- **Quality bar:** Production TypeScript, Zod validation, component tests on engine + schemas
- **Philosophy preserved:** No ads, scores, timers, notifications, diagnoses, or “correct” answers

---

## 2. Design principles

### 2.1 Experience (“Pixar meets Apple”)

- **Calm motion** — slow floats, gentle fades; respect `prefers-reduced-motion`
- **Premium spacing** — generous whitespace, large touch targets (44px+), safe areas on mobile
- **Visual hierarchy** — illustration dominates; UI chrome stays minimal
- **Warm palette** — cream, golden backpack, soft blue Pip; comic-book outlines on characters only
- **Magic without noise** — backpack opening reveals objects; no confetti, no sounds unless narrated

### 2.2 Content rules (from psychologists/coaches)

- Stories **recognise**, never teach or diagnose
- Wonder Together: open questions only
- Play Together: exploration, no fail states
- Pip's Pocket: one reflection, not a lesson

### 2.3 Engineering rules

- **Data over code** — new book = new JSON + assets, zero deploy
- **Schema first** — Zod validates every JSON file at load time
- **Composition over duplication** — one `StoryEngine`, one `SceneRenderer`, many books
- **Asset references, not embeds** — JSON points to files; never inline base64 in production JSON

---

## 3. Technology stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 15+** (App Router) | Already in use; keep |
| UI | **React 19**, **TypeScript 5** | Strict mode |
| Styling | **Tailwind CSS v4** | Design tokens via CSS variables |
| Motion | **Framer Motion** | Page transitions, layer entrance, backpack |
| Validation | **Zod** | All content schemas |
| Client storage | **Dexie** (IndexedDB) | Progress, coach overrides, offline asset index |
| PWA | **Serwist** or `@serwist/next` | Service worker, precache strategy |
| PDF export | **jspdf** + canvas capture | Coach Mode only |
| i18n (future) | **next-intl** | Stub messages; story JSON gains locale folders later |
| Testing | **Vitest** + Testing Library | Schemas, scene resolver, critical components |

---

## 4. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Child experience                         │
│  Home → Backpack → StoryEngine → Wonder → Play → Pocket        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      Presentation layer                          │
│  components/story/SceneRenderer  components/wonder|play|pocket   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                       Story engine (lib/)                        │
│  loader · schema · scene-resolver · progress · asset-resolver    │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
    ┌───────────▼──────────┐      ┌───────────▼──────────┐
    │  Content (stories/)  │      │  Asset library       │
    │  JSON per book       │      │  public/assets/      │
    └───────────┬──────────┘      └───────────┬──────────┘
                │                             │
    ┌───────────▼─────────────────────────────▼──────────┐
    │  API routes (read JSON) · static files (images)       │
    │  IndexedDB overrides (Coach Mode edits)               │
    └──────────────────────────────────────────────────────┘
```

**Coach Mode** writes to IndexedDB overrides (and optionally exports to downloadable ZIP). Production deploy reads base JSON + assets from repo; overrides merge at runtime.

---

## 5. Folder structure

```
pip-backpack/
├── app/                              # Routes (thin shells only)
│   ├── layout.tsx
│   ├── page.tsx                      # Home — magical backpack
│   ├── backpack/page.tsx             # Object grid
│   ├── story/[bookId]/
│   │   ├── page.tsx                  # Story reader
│   │   ├── wonder/page.tsx
│   │   ├── play/page.tsx
│   │   └── pocket/page.tsx
│   ├── coach/                        # PIN-gated
│   │   ├── page.tsx                  # PIN gate
│   │   ├── library/page.tsx
│   │   └── [bookId]/
│   │       ├── edit/page.tsx         # Story + scene editor
│   │       ├── wonder/page.tsx
│   │       ├── play/page.tsx
│   │       ├── pocket/page.tsx
│   │       └── assets/page.tsx       # Upload / assign assets
│   └── api/
│       ├── library/route.ts
│       ├── stories/[bookId]/route.ts
│       └── assets/[...path]/route.ts # Optional: coach upload target
│
├── components/
│   ├── ui/                           # Primitives (Button, Typography…)
│   ├── layout/                       # AppShell, MobileActionBar…
│   ├── home/                         # AnimatedBackpack, HomeStoryList
│   ├── library/                      # StoryObject, StoryObjectGrid
│   ├── story/
│   │   ├── StoryEngine.tsx           # Orchestrator
│   │   ├── SceneRenderer.tsx         # ★ Layer compositor
│   │   ├── layers/
│   │   │   ├── BackgroundLayer.tsx
│   │   │   ├── CharacterLayer.tsx
│   │   │   ├── ObjectLayer.tsx
│   │   │   └── SpeechBubbleLayer.tsx
│   │   ├── NarrationPlayer.tsx       # Future audio
│   │   └── StoryControls.tsx
│   ├── wonder/
│   ├── play/
│   ├── pocket/
│   └── coach/
│
├── lib/
│   ├── schemas/                      # Zod — source of truth
│   ├── story/
│   │   ├── loader.ts
│   │   ├── server-loader.ts
│   │   ├── progress.ts
│   │   └── scene-resolver.ts         # ★ Resolves asset IDs → URLs
│   ├── assets/
│   │   ├── registry.ts               # Global character/background catalogue
│   │   └── urls.ts
│   ├── storage/
│   └── coach/
│
├── stories/                          # ★ Content (JSON only)
│   ├── library.json
│   └── book01/
│       ├── book.json                 # ★ Single bundle file (v2)
│       └── manifest.json             # Asset list for offline precache
│
├── public/
│   └── assets/                       # ★ Supplied artwork (never AI-generated in repo)
│       ├── characters/
│       │   ├── leo/
│       │   │   ├── neutral-standing.webp
│       │   │   ├── happy-kneeling.webp
│       │   │   └── ...
│       │   ├── pip/
│       │   ├── dad/
│       │   ├── mum/
│       │   └── whiskers/
│       ├── backgrounds/
│       │   ├── bedroom-morning.webp
│       │   ├── hallway.webp
│       │   ├── leo-room.webp
│       │   └── ...
│       ├── objects/
│       │   ├── green-brick.webp
│       │   ├── spaceship.webp
│       │   └── ...
│       ├── bubbles/
│       │   ├── speech-round.svg
│       │   ├── speech-whisper.svg
│       │   └── narration-caption.svg
│       ├── icons/
│       │   └── story-objects/        # Green brick, radio, volcano…
│       └── covers/
│           └── book01-cover.webp
│
├── docs/
│   ├── ARCHITECTURE.md               # v1 (historical)
│   ├── ARCHITECTURE_V2.md            # This document
│   ├── ART_STYLE.md                  # Visual guidelines for suppliers
│   └── ASSET_PIPELINE.md             # How to deliver artwork
│
└── types/
```

### 5.1 Folder rationale

| Path | Role |
|------|------|
| `stories/` | **Data** — JSON only; version-controlled; no binary art |
| `public/assets/` | **Supplied art** — characters, backgrounds, objects; WebP preferred |
| `lib/schemas/` | Validates all content; breaking changes bump schema version |
| `components/story/layers/` | One renderer per layer type; engine stays dumb |
| `stories/bookNN/manifest.json` | Lists all asset paths for offline precache per book |

### 5.2 v1 layout (deprecated after migration)

Currently: `stories/book01/story.json` + `public/stories/book01/illustrations/*.svg`

Migration: convert each page to layered `scene` objects; move art into `public/assets/` when supplied; keep SVG fallbacks until real art arrives.

---

## 6. Component architecture

### 6.1 Layer model

```
┌─────────────────────────────────────────┐
│  app/* pages           — routing only   │
├─────────────────────────────────────────┤
│  Feature components    — Story, Wonder  │
├─────────────────────────────────────────┤
│  Scene layers          — Background,    │
│                          Character,     │
│                          Bubble, Object │
├─────────────────────────────────────────┤
│  UI primitives         — Button, Type   │
├─────────────────────────────────────────┤
│  lib/                  — schemas, load  │
└─────────────────────────────────────────┘
```

### 6.2 Component catalogue

#### Home & library

| Component | Responsibility |
|-----------|----------------|
| `AnimatedBackpack` | Floating backpack; open animation; objects float out |
| `HomeStoryList` | Optional direct story cards on home (mobile-friendly) |
| `StoryObject` | One story object tile (icon from `assets/icons/story-objects/`) |
| `StoryObjectGrid` | Grid from `library.json`; no book numbers shown to child |

#### Story engine (v2 core)

| Component | Responsibility |
|-----------|----------------|
| `StoryEngine` | Load book, page index, progress, navigation, completion |
| `SceneRenderer` | Compose layers for current page in z-order |
| `BackgroundLayer` | Full-bleed background image |
| `CharacterLayer` | Positioned sprite(s) with pose ID → asset URL |
| `ObjectLayer` | Props (green brick, spaceship…) positioned on scene |
| `SpeechBubbleLayer` | SVG/HTML bubbles with tail; positioned text |
| `NarrationPlayer` | Optional `<audio>` + caption sync (future) |
| `StoryControls` | Prev / Continue; sticky on mobile |
| `StoryProgress` | Dots only — no percentages |

#### Post-story (unchanged pattern)

| Component | Responsibility |
|-----------|----------------|
| `WonderCarousel` | One question per screen; swipe; no scoring |
| `ActivityRenderer` | Dispatches `tap-explore`, `drag-explore`, `draw-space` |
| `PocketReflection` | Single takeaway + Pip |

#### Coach Mode

| Component | Responsibility |
|-----------|----------------|
| `PinGate` | PIN entry / setup |
| `CoachLibrary` | All books; duplicate, create, disable |
| `BookEditor` | Metadata, object type, cover |
| `SceneEditor` | Visual editor for layers per page (Phase 3+) |
| `AssetUploader` | Upload to IndexedDB blob store or API |
| `WonderEditor` / `ActivityEditor` | Form editors |
| `PdfExport` | Render story scenes to PDF |
| `LibraryBackup` | Export/import ZIP (JSON + assets) |

### 6.3 Character system

Characters are **not drawn in code** in v2. They are **asset references**:

```typescript
// Example reference in JSON
{
  "characterId": "leo",
  "pose": "kneeling-smile",
  "expression": "happy",
  "position": { "x": 25, "y": 60, "scale": 1, "flip": false }
}
```

**Catalogue** (`public/assets/characters/leo/manifest.json`):

```json
{
  "characterId": "leo",
  "displayName": "Leo",
  "poses": {
    "standing-neutral": { "file": "standing-neutral.webp", "anchor": "feet" },
    "kneeling-smile": { "file": "kneeling-smile.webp", "anchor": "feet" }
  },
  "expressions": ["neutral", "happy", "puzzled", "thinking"]
}
```

`CharacterLayer` resolves pose → URL, applies position (% of scene), z-index, optional Framer Motion entrance.

**Built-in characters:** Leo, Pip, Dad, Mum, Whiskers — extensible via asset manifests without code changes.

---

## 7. Story JSON schema

### 7.1 Design goals

- One **`book.json`** per book (consolidates v1's `meta`, `story`, `coach`, `activity`)
- **Schema version** field for migrations
- **Scene-based pages** support layered composition
- **Fallback mode** for migration: `mode: "flat"` uses single illustration (v1 compatible)

### 7.2 `stories/library.json`

```typescript
const StoryObjectType = z.enum([
  "green-brick", "radio", "wall", "volcano", "backpack",
  "treasure-map", "battery", "puzzle-piece", "compass",
]);

const LibraryEntry = z.object({
  id: z.string().regex(/^book\d+$/),
  object: StoryObjectType,
  title: z.string(),
  subtitle: z.string().optional(),
  cover: z.string(),                    // e.g. "assets/covers/book01-cover.webp"
  sortOrder: z.number().int().nonnegative(),
  enabled: z.boolean().default(true),
});

const LibrarySchema = z.object({
  schemaVersion: z.literal(2),
  books: z.array(LibraryEntry),
});
```

### 7.3 `stories/bookNN/book.json`

```typescript
const Position = z.object({
  x: z.number().min(0).max(100),       // % from left
  y: z.number().min(0).max(100),       // % from top
  width: z.number().min(0).max(100).optional(),
  scale: z.number().positive().default(1),
  flip: z.boolean().default(false),
  zIndex: z.number().int().default(0),
});

const CharacterLayer = z.object({
  type: z.literal("character"),
  characterId: z.enum(["leo", "pip", "dad", "mum", "whiskers"]),
  pose: z.string(),
  expression: z.string().optional(),
  position: Position,
  animation: z.enum(["none", "fade-in", "float", "bounce-soft"]).default("none"),
});

const ObjectLayer = z.object({
  type: z.literal("object"),
  asset: z.string(),                    // e.g. "objects/green-brick.webp"
  position: Position,
});

const SpeechBubble = z.object({
  type: z.literal("speech"),
  text: z.string(),
  speaker: z.enum(["leo", "pip", "dad", "mum", "narrator"]).optional(),
  position: Position,
  style: z.enum(["speech", "whisper", "thought", "narration"]).default("speech"),
  tailDirection: z.enum(["left", "right", "up", "down"]).optional(),
});

const SceneLayer = z.discriminatedUnion("type", [
  z.object({ type: z.literal("background"), asset: z.string() }),
  CharacterLayer,
  ObjectLayer,
  SpeechBubble,
]);

const ScenePage = z.object({
  id: z.string(),
  mode: z.enum(["scene", "flat"]).default("scene"),
  // scene mode — layered
  layers: z.array(SceneLayer).optional(),
  // flat mode — v1 migration fallback
  illustration: z.string().optional(),
  text: z.string().optional(),
  // shared
  narration: z.string().optional(),     // audio path: "narration/book01/page-01.mp3"
  transition: z.enum(["fade", "slide", "gentle-zoom"]).optional(),
});

const WonderQuestion = z.object({
  id: z.string(),
  text: z.string().min(1),
  pipPrompt: z.string().optional(),     // Coach-only hint
});

const ActivitySchema = z.discriminatedUnion("type", [
  /* tap-explore | drag-explore | draw-space — same as v1 */
]);

const BookSchema = z.object({
  schemaVersion: z.literal(2),
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  object: StoryObjectType,
  cover: z.string(),
  characters: z.array(z.string()).default(["leo", "pip"]),
  story: z.object({
    transition: z.enum(["fade", "slide", "gentle-zoom"]).default("fade"),
    pages: z.array(ScenePage).min(1),
  }),
  wonder: z.object({
    intro: z.string().optional(),
    questions: z.array(WonderQuestion).min(1),
  }),
  play: ActivitySchema,
  pocket: z.object({
    reflection: z.string().min(1),
    pipLine: z.string().optional(),
  }),
});
```

### 7.4 Example page (Book One — Page 3)

```json
{
  "id": "page-03",
  "mode": "scene",
  "layers": [
    { "type": "background", "asset": "backgrounds/hallway.webp" },
    {
      "type": "character",
      "characterId": "pip",
      "pose": "pointing-excited",
      "expression": "curious",
      "position": { "x": 70, "y": 55, "scale": 1, "zIndex": 2 }
    },
    {
      "type": "character",
      "characterId": "leo",
      "pose": "standing-curious",
      "position": { "x": 30, "y": 58, "scale": 1, "zIndex": 2 }
    },
    {
      "type": "object",
      "asset": "objects/green-brick.webp",
      "position": { "x": 50, "y": 78, "scale": 0.6, "zIndex": 3 }
    },
    {
      "type": "speech",
      "speaker": "pip",
      "text": "Look!",
      "style": "whisper",
      "position": { "x": 55, "y": 25, "zIndex": 4 },
      "tailDirection": "down"
    }
  ],
  "narration": "narration/book01/page-03.mp3"
}
```

### 7.5 Flat fallback (migration)

Existing Book One keeps working during transition:

```json
{
  "id": "page-03",
  "mode": "flat",
  "illustration": "stories/book01/illustrations/page-03.svg",
  "text": "Halfway there… Pip stopped. His big eyes grew even bigger…"
}
```

`SceneRenderer` checks `mode` and renders either compositor or legacy `StoryIllustration`.

---

## 8. Illustration & asset organisation

### 8.1 Principle: supplied assets only

- **Do not generate artwork in the codebase**
- Placeholder assets (current SVGs) remain until real art is delivered
- `docs/ASSET_PIPELINE.md` documents naming, dimensions, and export settings for illustrators

### 8.2 Asset categories

| Category | Path | Format | Notes |
|----------|------|--------|-------|
| **Characters** | `public/assets/characters/{id}/` | WebP + transparent PNG fallback | Multiple poses per character; consistent anchor point (feet) |
| **Backgrounds** | `public/assets/backgrounds/` | WebP | 1200×1500 portrait; reusable across books |
| **Objects** | `public/assets/objects/` | WebP transparent | Green brick, props, story objects |
| **Expressions** | Overlays or pose variants | WebP | Prefer separate pose files over runtime face swap initially |
| **Speech bubbles** | `public/assets/bubbles/` | SVG | Scalable; text rendered in HTML for a11y |
| **Icons** | `public/assets/icons/story-objects/` | SVG | Backpack grid objects |
| **Covers** | `public/assets/covers/` | WebP | Library / coach thumbnails |

### 8.3 Naming convention

```
characters/leo/kneeling-smile.webp
characters/pip/pointing-excited.webp
backgrounds/leo-bedroom-morning.webp
objects/green-brick.webp
covers/book01-tiny-green-brick.webp
icons/story-objects/green-brick.svg
```

### 8.4 Scene composition rules

- Background always **layer 0**, full bleed
- Characters **layer 10–30** (left-to-right z-index in JSON)
- Objects **layer 40–50**
- Speech bubbles **layer 60+** (always on top)
- Narration text (if no bubble) uses `style: "narration"` caption bar at bottom — accessible, selectable

### 8.5 Responsive behaviour

- Scene container: **4:5 aspect** on mobile, max-height capped so controls stay visible
- Layers use **percentage positioning** — scales with container
- `object-fit: cover` on backgrounds; `contain` on characters

### 8.6 Offline manifest

Each book includes `stories/bookNN/manifest.json`:

```json
{
  "bookId": "book01",
  "assets": [
    "assets/backgrounds/hallway.webp",
    "assets/characters/pip/pointing-excited.webp",
    "assets/objects/green-brick.webp"
  ]
}
```

Service worker precaches manifest assets after first book open.

---

## 9. Adding books without code

### 9.1 Steps (content author / coach)

1. **Create folder** `stories/book03/`
2. **Write** `book.json` (copy from template; validate with `npm run validate:content`)
3. **Add assets** to `public/assets/` following naming guide
4. **Update** `stories/book03/manifest.json` with asset list
5. **Register** in `stories/library.json` with object type + cover path
6. **Deploy** — git push triggers Vercel rebuild (or Coach export/import)

No React files. No route changes. `book03` is picked up automatically by dynamic routes `[bookId]`.

### 9.2 Validation CLI (post-approval)

```bash
npm run validate:content
# → Validates all book.json + library.json
# → Checks referenced assets exist on disk
# → Reports missing poses / broken paths
```

### 9.3 Template

`stories/_template/book.json` — copy-paste starter with one flat page and empty wonder/play/pocket.

---

## 10. Coach Mode

### 10.1 Entry

- Long-press footer Pip (800ms) or triple-tap version string
- Route: `/coach` → PIN gate → session in `sessionStorage`

### 10.2 Authentication

- 4–6 digit PIN, bcrypt hash in IndexedDB
- Session clears on tab close
- PIN reset via backup file import (no email recovery in v1)

### 10.3 Capabilities

| Feature | Implementation |
|---------|----------------|
| **Edit stories** | Override `book.json` in IndexedDB; merge at load |
| **Upload artwork** | Blob store + path assignment; export merges into ZIP |
| **Edit questions** | Wonder section form |
| **Edit activities** | Activity JSON form |
| **Export PDF** | Render each page scene to canvas → jspdf |
| **Duplicate story** | Clone `book.json` → new `bookNN` ID |
| **Create new story** | Template + new ID generator |
| **Enable/disable** | Toggle in library entry |

### 10.4 Security note

Client PIN is **child-safety obfuscation**, not enterprise security.

---

## 11. Story engine (layered pages)

### 11.1 Load flow

```
fetch /api/stories/book01
  → parse BookSchema (Zod)
  → merge IndexedDB overrides (coach)
  → resolve asset paths (scene-resolver)
  → StoryEngine renders page[n]
  → SceneRenderer composes layers
  → save progress on page change
```

### 11.2 Scene resolver API

```typescript
function resolveAssetPath(relativePath: string): string;
function resolveCharacterPose(characterId: string, pose: string): CharacterAsset;
function validateSceneAssets(page: ScenePage): ValidationResult;
```

### 11.3 Animations (optional per layer)

| Animation | Use |
|-----------|-----|
| `none` | Default |
| `fade-in` | Page enter |
| `float` | Pip idle |
| `bounce-soft` | Playful moment |

All respect `prefers-reduced-motion`.

---

## 12. State, offline & PWA

| State | Store |
|-------|-------|
| Page progress | IndexedDB `progress` |
| Coach PIN | IndexedDB `settings` |
| Coach overrides | IndexedDB `overrides` |
| Cached assets | Cache API via service worker |

**Caching tiers:**

1. App shell + `library.json` — precache
2. Book JSON — precache on library fetch
3. Assets — cache on first scene render; manifest-driven

---

## 13. Migration from v1 prototype

**Preserved (no throwaway):**

| Asset | Migration |
|-------|-----------|
| Book One copy (12 pages) | Convert to `book.json` schema v2 |
| Wonder / Play / Pocket copy | Move into `book.json` sections |
| `library.json` | Bump to schemaVersion 2; add `cover` |
| Story flow routes & components | Keep; refactor renderer |
| Mobile UX (sticky bars, home list) | Keep |
| Dexie progress | Keep |
| Vercel deployment | Keep |
| Placeholder SVG illustrations | `mode: "flat"` until supplied art replaces |

**Refactor:**

- Split/consolidate JSON files → single `book.json`
- Add `SceneRenderer` + layer components
- Move art path convention → `public/assets/`
- Expand Coach Mode per §10

**Not migrated:**

- `book02` ZOOMIE duplicate (superseded by Book One)
- Inline SVG character components → replaced by asset refs when art supplied (keep as dev fallback)

---

## 14. Development phases (post-approval)

| Phase | Scope |
|-------|--------|
| **A — Schema & migration** | v2 Zod schemas; `book.json`; flat fallback; validate CLI |
| **B — Scene renderer** | Layer components; SceneRenderer; migrate Book One metadata |
| **C — Asset pipeline** | Folder structure; manifests; ASSET_PIPELINE.md; placeholder policy |
| **D — Premium polish** | Pixar/Apple motion, typography, home magic |
| **E — Coach Mode** | Editors, upload, duplicate, PDF, backup |
| **F — PWA offline** | Serwist; per-book precache |
| **G — Scale test** | 100 mock books; performance budget |

---

## 15. Open questions

Please confirm or adjust:

1. **Single `book.json` vs split files** — recommended single file for coach export; OK?
2. **Scene editor** — visual drag-drop in Coach Mode Phase E, or JSON-only initially?
3. **Narration** — include audio schema now, implement later?
4. **Book IDs** — keep `book01` format or slugs (`tiny-green-brick`)?
5. **Asset delivery** — will you supply layered PSD/exports, or flat per-page images during transition?
6. **Mum character** — needed in Book One, or later books only?
7. **British English** — confirm as default locale?

---

## Approval

**Existing prototype remains live** while architecture v2 is reviewed.

Reply with:

- **Approved as-is** — begin Phase A (schema + migration, no visual regressions)
- **Changes needed** — specify sections
- **Answers to open questions**

---

*Pip's Backpack — Architecture v2.0 — therapeutic storytelling platform*
