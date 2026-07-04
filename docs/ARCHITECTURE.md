# Pip's Backpack — Technical Architecture

> **Status:** Approved — Scene Engine architecture (v2.0)  
> **Version:** 2.0  
> **Last updated:** 2026-07-04

This document defines the complete technical architecture for *Pip's Backpack* — a therapeutic storytelling platform for children and their coaches/parents.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Principles & Constraints](#2-design-principles--constraints)
3. [Technology Stack](#3-technology-stack)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Routing & Navigation Flow](#6-routing--navigation-flow)
7. [Component Architecture](#7-component-architecture)
8. [State Management](#8-state-management)
9. [JSON Schemas](#9-json-schemas)
10. [Scene Engine & Asset Library](#10-scene-engine--asset-library)
11. [Story Engine](#11-story-engine)
12. [Storage Layer](#12-storage-layer)
13. [Coach Mode](#13-coach-mode)
14. [PWA & Offline Strategy](#14-pwa--offline-strategy)
15. [Animation & Motion Guidelines](#15-animation--motion-guidelines)
16. [Accessibility & UX](#16-accessibility--ux)
17. [Future-Proofing](#17-future-proofing)
18. [Development Phases](#18-development-phases)
19. [Open Questions](#19-open-questions)

---

## 1. Executive Summary

*Pip's Backpack* is a calm, data-driven storytelling platform. Stories are **recognition tools**, not teaching tools. The app serves two personas:

| Persona | Goal |
|---------|------|
| **Child** | Experience stories, wonder questions, gentle play, and a single pocket reflection |
| **Coach / Parent** | Facilitate conversation; optionally curate content via hidden Coach Mode |

All story content lives in **local JSON files** under `stories/`. The UI is entirely **component-driven** and **schema-validated**. The architecture is designed to scale to **100+ books** without structural changes.

---

## 2. Design Principles & Constraints

### 2.1 What we build

- Warm, safe, magical UX (calm palette, large illustrations, expressive characters)
- JSON-defined stories with reusable engine components
- Progress memory (resume where you left off)
- Offline-first PWA
- Hidden Coach Mode (PIN-gated content management)

### 2.2 What we explicitly do NOT build

| Excluded | Rationale |
|----------|-----------|
| Advertisements | Therapeutic trust |
| Subscriptions / paywalls | Accessibility for coaches & families |
| Scoreboards / achievements | No gamification |
| Timers / streaks | No pressure or addiction mechanics |
| Push notifications | No interruption |
| Correct/incorrect answers | Wonder Together is discussion-only |
| Lessons or diagnoses in copy | Philosophy: recognition in story, understanding in conversation |

### 2.3 Architectural decisions (summary)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 (App Router) | SSR/SSG for first paint; file-based routing; PWA support |
| Styling | Tailwind CSS v4 | Utility-first; design tokens via CSS variables |
| Animation | Framer Motion | Page transitions; backpack float; gentle, non-distracting motion |
| Content storage | Local JSON + public assets | Offline-capable; coach-editable; CMS-ready export shape |
| Runtime storage | IndexedDB (via Dexie) | Progress, settings, coach PIN hash, draft edits |
| Validation | Zod | Runtime schema validation for all JSON |
| i18n | `next-intl` (stubbed) | Future localisation without refactor |
| Testing | Vitest + Testing Library | Schema & engine unit tests; component smoke tests |

---

## 3. Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│  React 19 · TypeScript 5 · Tailwind CSS · Framer Motion │
├─────────────────────────────────────────────────────────┤
│  lib/          schemas, storage, story loader, coach    │
│  components/   UI primitives + feature components       │
│  stories/      book01…bookNN (JSON + illustrations)     │
│  public/       PWA manifest, icons, shared assets       │
└─────────────────────────────────────────────────────────┘
```

**Dependencies (initial):**

| Package | Purpose |
|---------|---------|
| `next`, `react`, `react-dom` | Core framework |
| `typescript` | Type safety |
| `tailwindcss`, `@tailwindcss/postcss` | Styling |
| `framer-motion` | Animations |
| `zod` | JSON schema validation |
| `dexie` | IndexedDB wrapper |
| `bcryptjs` | Coach PIN hashing (client-side) |
| `jspdf` + `html2canvas` | PDF export (Coach Mode) |
| `next-pwa` or `@serwist/next` | Service worker / offline |
| `next-intl` | i18n scaffolding |
| `clsx`, `tailwind-merge` | Conditional class names |

---

## 4. High-Level Architecture

```
                    ┌──────────────┐
                    │   Browser    │
                    │  (PWA shell) │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌───────────┐    ┌─────────────┐   ┌────────────┐
   │ App Router│    │ Story Engine│   │ Coach Mode │
   │  (pages)  │───▶│  (reader)   │   │  (editor)  │
   └───────────┘    └──────┬──────┘   └─────┬──────┘
                           │                 │
                    ┌──────▼──────┐   ┌──────▼──────┐
                    │Story Loader │   │ Edit Store  │
                    │  + Zod      │   │ (IndexedDB) │
                    └──────┬──────┘   └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ stories/    │
                    │  bookNN/    │
                    └─────────────┘
```

**Data flow (Child path):**

1. Home → animated backpack reveals story **objects** (not books)
2. Object maps to `bookId` via `library.json`
3. Story Engine loads `story.json`, renders **scenes** composed from the Asset Library
4. On completion → Wonder Together (`coach.json` questions)
5. → Play Together (`activity.json`)
6. → Pip's Pocket (reflection from `coach.json`)
7. Progress persisted to IndexedDB after each page

---

## 5. Folder Structure

```
pip-backpack/
├── CreatorBible/                     # Canonical world definitions (NOT user docs)
│   ├── Leo.md                        # Character bible — poses, rules, appearance
│   ├── Pip.md
│   ├── Dad.md
│   ├── Mum.md
│   ├── Whiskers.md
│   ├── World.md                      # Locations, environment rules
│   ├── StoryRules.md                 # Narrative constraints
│   ├── IllustrationRules.md          # Scene composition rules
│   ├── Objects.md                    # Story object inventory
│   └── ColourPalette.md              # Colour source of truth
│
├── assets/
│   └── manifest.json                 # Asset Library catalog (Zod-validated)
│
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── library/route.ts
│   │   ├── assets/route.ts           # Serves Asset Library manifest
│   │   └── stories/[bookId]/route.ts
│   ...
│
├── components/
│   ├── scene/
│   │   ├── SceneRenderer.tsx         # Composes scenes from Asset Library
│   │   └── useAssetManifest.ts       # Client hook for manifest
│   ├── characters/
│   │   ├── Leo.tsx, Pip.tsx, Dad.tsx, Whiskers.tsx
│   ...
│
├── lib/
│   ├── schemas/
│   │   ├── asset.ts                  # Asset Library schema
│   │   ├── scene.ts                  # Scene composition schema
│   │   ├── story.ts                  # Story pages reference scenes
│   │   ...
│   ├── assets/
│   │   └── loader.ts                 # Load manifest from disk
│   ├── scene/
│   │   ├── position.ts               # Position presets & transforms
│   │   └── characters.ts             # Character component resolution
│   ...
│
├── stories/                          # Content root (100+ books)
│   └── book01/
│       ├── story.json                # Pages with scene definitions
│       ...
│
├── public/
│   ├── assets/                       # Reusable Asset Library SVGs
│   │   ├── backgrounds/
│   │   ├── objects/
│   │   ├── props/
│   │   ├── speech-bubbles/
│   │   └── effects/
│   └── stories/bookNN/illustrations/ # Legacy flat SVGs (migration fallback)
│
├── docs/
│   ├── ARCHITECTURE.md               # This document
│   └── ART_STYLE.md                  # Visual style reference
│
└── ...
```

### 5.1 Folder rationale

| Folder | Responsibility |
|--------|----------------|
| `CreatorBible/` | **Canonical world definitions** — characters, rules, palette. Single source of truth for all future illustration and story authoring. Not loaded at runtime. |
| `assets/` | Asset Library manifest (`manifest.json`) — catalog of reusable visual assets |
| `public/assets/` | Asset Library files served at runtime (backgrounds, objects, props, effects) |
| `app/` | Routes only — thin pages that compose feature components |
| `components/scene/` | Scene Engine — composes pages from Asset Library layers |
| `components/` | All UI; grouped by feature domain |
| `lib/` | Pure logic: loading, validation, storage, scene resolution |
| `stories/` | **Content as data** — story copy and scene definitions |
| `public/stories/` | Legacy per-book flat illustrations (migration fallback) |
| `types/` | TypeScript types derived from Zod for app-wide imports |
| `tests/` | Mirrors `lib/` structure |

**Key rule:** Pages in `app/` must not contain story text, question text, or hardcoded book IDs. All content comes from JSON.

---

## 6. Routing & Navigation Flow

```
/                          Home (Animated Backpack)
/backpack                  Story object selection
/story/[bookId]            Story Engine (page N)
/story/[bookId]/wonder     Wonder Together
/story/[bookId]/play       Play Together
/story/[bookId]/pocket     Pip's Pocket → return home

/coach                     PIN entry (hidden entry: long-press logo 3s)
/coach/library             Manage all books
/coach/[bookId]/story      Edit pages
/coach/[bookId]/wonder     Edit questions
/coach/[bookId]/play       Edit activity
/coach/[bookId]/pocket     Edit reflection
/coach/settings            Backup, export PDF, change PIN
```

### 6.1 Navigation rules

- **No forced linear lock** — child can leave anytime; progress is saved
- **Soft guidance** — after last story page, primary CTA is "Wonder Together"
- **No back-stack traps** — Back always works; leaving mid-story saves page index
- **Coach routes** — middleware checks session cookie/token (client-side session in IndexedDB + short-lived sessionStorage flag after PIN)

---

## 7. Component Architecture

### 7.1 Layer model

```
┌─────────────────────────────────────────┐
│  Pages (app/)          — route shells   │
├─────────────────────────────────────────┤
│  Feature components    — Story, Wonder… │
├─────────────────────────────────────────┤
│  Layout components     — AppShell, etc. │
├─────────────────────────────────────────┤
│  UI primitives         — Button, Card…  │
├─────────────────────────────────────────┤
│  lib/                  — data & logic   │
└─────────────────────────────────────────┘
```

### 7.2 Component catalogue

#### UI Primitives (`components/ui/`)

| Component | Props (key) | Purpose |
|-----------|-------------|---------|
| `Button` | `variant`, `size`, `onClick`, `children` | Primary/ghost/soft actions |
| `Card` | `className`, `children` | Warm bordered container |
| `Typography` | `variant`: `story` \| `wonder` \| `pocket` \| `label` | Consistent type scale |
| `SafeArea` | `children` | Mobile notch padding |
| `IconButton` | `icon`, `label` (a11y) | Accessible icon-only control |
| `ProgressDots` | `total`, `current` | Non-numeric progress |

#### Layout (`components/layout/`)

| Component | Purpose |
|-----------|---------|
| `AppShell` | Full-viewport warm background, centered content column |
| `PageTransition` | Shared Framer Motion `AnimatePresence` wrapper |
| `BackButton` | Consistent back navigation |

#### Home (`components/home/`)

| Component | Purpose |
|-----------|---------|
| `AnimatedBackpack` | Hero: floating backpack, tap to open |
| `BackpackReveal` | Sequence: lid opens → objects float out → navigate to `/backpack` |

#### Library (`components/library/`)

| Component | Purpose |
|-----------|---------|
| `StoryObject` | One story object (icon, label, gentle hover) |
| `StoryObjectGrid` | Responsive grid; reads from `library.json` |

**Story objects (fixed set of visual types, unlimited stories):**

| Object key | Example use |
|------------|-------------|
| `green-brick` | Boundaries, building |
| `radio` | Communication, voices |
| `wall` | Protection, separation |
| `volcano` | Big feelings |
| `backpack` | Carrying worries |
| `treasure-map` | Discovery, paths |
| `battery` | Energy, rest |
| `puzzle-piece` | Identity, fitting in |
| `compass` | Direction, choices |

Each book's `meta.json` declares which object represents it on the backpack screen.

#### Story Engine (`components/story/`)

| Component | Responsibility |
|-----------|----------------|
| `StoryEngine` | Loads book, manages `currentPage`, persists progress, handles completion |
| `StoryPage` | Layout: illustration dominant (~70vh), text below |
| `StoryIllustration` | `next/image`, blur placeholder, offline cache |
| `StoryText` | Large readable story typography |
| `StoryControls` | Previous / Next; no auto-advance |
| `StoryProgress` | Dots only — no percentages |
| `NarrationButton` | Stub: plays `page.narration` audio if present |

#### Wonder Together (`components/wonder/`)

| Component | Responsibility |
|-----------|----------------|
| `WonderCard` | Full-screen question; large type; Pip optional corner presence |
| `WonderCarousel` | One question visible; swipe or tap to continue |

#### Play Together (`components/play/`)

| Component | Responsibility |
|-----------|----------------|
| `ActivityRenderer` | Switch on `activity.type` |
| `TapExplore` | Click areas reveal gentle animations/text |
| `DragExplore` | Drag items to zones; all zones accept; no failure |
| `DrawSpace` | Canvas draw; save optional to IndexedDB (not scored) |

#### Pip's Pocket (`components/pocket/`)

| Component | Responsibility |
|-----------|----------------|
| `PocketReflection` | Shows `reflection` string from coach.json |
| `PipPocket` | Pip animation + reflection + "Finish" → home |

#### Coach Mode (`components/coach/`)

| Component | Responsibility |
|-----------|----------------|
| `PinGate` | 4–6 digit PIN entry |
| `BookEditor` | CRUD book metadata |
| `PageEditor` | Add/remove/reorder story pages |
| `QuestionEditor` | Wonder question list editor |
| `ActivityEditor` | JSON form for activity |
| `ArtworkUploader` | Upload to `illustrations/` (dev: base64 in IndexedDB override; prod: API route later) |
| `LibraryBackup` | Export/import full library JSON |
| `PdfExport` | Render story + questions to PDF for printing |

#### Characters (`components/characters/`)

| Component | Responsibility |
|-----------|----------------|
| `Pip` | SVG/motion Pip; expressions: `neutral`, `curious`, `excited`, `gentle` |
| `Leo` | Leo illustration for stories referencing him |

---

## 8. State Management

No Redux. State is intentionally minimal:

| State type | Store | Scope |
|------------|-------|-------|
| Story progress | IndexedDB (`progress` table) | Per book: `{ bookId, pageIndex, updatedAt }` |
| App settings | IndexedDB (`settings` table) | Coach PIN hash, theme, locale |
| Coach overrides | IndexedDB (`overrides` table) | Edited JSON blobs keyed by bookId + file |
| Coach session | sessionStorage | `coachAuthenticated: true` (cleared on tab close) |
| UI ephemeral | React `useState` | Current page, carousel index, animation phase |
| Server content | Static import / fetch | `stories/**/*.json` at build time |

**Merge strategy:** At load time, `loader.ts` merges base JSON from `stories/` with any coach override from IndexedDB. Overrides win.

---

## 9. JSON Schemas

All schemas defined in `lib/schemas/` with Zod. Types exported via `z.infer<>`.

### 9.1 `stories/library.json`

Master index for the backpack object grid.

```typescript
// lib/schemas/library.ts
const StoryObjectType = z.enum([
  "green-brick", "radio", "wall", "volcano", "backpack",
  "treasure-map", "battery", "puzzle-piece", "compass"
]);

const LibraryBookEntry = z.object({
  id: z.string().regex(/^book\d+$/),       // e.g. "book01"
  object: StoryObjectType,
  title: z.string().min(1),
  subtitle: z.string().optional(),          // Optional short line for grid
  sortOrder: z.number().int().nonnegative(),
  enabled: z.boolean().default(true),
});

const LibrarySchema = z.object({
  version: z.literal(1),
  books: z.array(LibraryBookEntry),
});
```

**Example:**

```json
{
  "version": 1,
  "books": [
    {
      "id": "book01",
      "object": "volcano",
      "title": "When Feelings Bubble Up",
      "subtitle": "Leo and the warm volcano",
      "sortOrder": 1,
      "enabled": true
    }
  ]
}
```

### 9.2 `stories/bookNN/meta.json`

Book-level metadata (optional if all fields exist in library.json; kept for coach export bundles).

```typescript
const BookMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  object: StoryObjectType,
  characters: z.array(z.enum(["leo", "pip"])).default(["leo", "pip"]),
  ageRange: z.object({
    min: z.number().int().min(4).max(12),
    max: z.number().int().min(4).max(12),
  }).optional(),
  tags: z.array(z.string()).optional(),     // For coach search only
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
```

### 9.3 `stories/bookNN/story.json`

Core story definition. Each page is a **Scene** — not a static illustration.

```typescript
const StoryPageSchema = z.object({
  id: z.string(),
  scene: SceneSchema.optional(),              // Composable scene (preferred)
  illustration: z.string().optional(),        // Legacy flat SVG (migration fallback)
  text: z.string().min(1),
  narration: z.string().optional(),
  pipExpression: PipExpression.optional(),    // Legacy — prefer scene character expression
}).refine(page => page.scene || page.illustration);

const StorySchema = z.object({
  version: z.literal(1),
  bookId: z.string(),
  pages: z.array(StoryPageSchema).min(1),
  transition: z.enum(["fade", "slide", "gentle-zoom"]).default("fade"),
});
```

**Example page (scene-based):**

```json
{
  "id": "page-03",
  "scene": {
    "id": "scene-03",
    "background": { "id": "hallway", "category": "background" },
    "characters": [
      {
        "id": "leo-03",
        "character": "leo",
        "pose": "reaching",
        "expression": "curious",
        "position": "left"
      },
      {
        "id": "pip-03",
        "character": "pip",
        "pose": "peering",
        "expression": "curious",
        "position": "right"
      }
    ],
    "objects": [
      {
        "id": "green-brick-03",
        "asset": { "id": "green-brick", "category": "object" },
        "position": "center"
      }
    ],
    "dialogue": "mixed"
  },
  "text": "Halfway there… Pip stopped. On the floor sat a tiny green Lego brick."
}
```

### 9.3.1 `assets/manifest.json`

Global Asset Library catalog.

```typescript
const AssetCategory = z.enum([
  "character", "background", "prop", "object", "speech-bubble", "effect"
]);

const AssetEntrySchema = z.object({
  id: z.string(),
  category: AssetCategory,
  label: z.string(),
  path: z.string().optional(),                // SVG path under public/assets/
  component: z.enum(["leo", "pip", "dad", "mum", "whiskers"]).optional(),
  poses: z.array(z.string()).optional(),
  expressions: z.array(z.string()).optional(),
});

const AssetManifestSchema = z.object({
  version: z.literal(1),
  assets: z.array(AssetEntrySchema),
});
```

### 9.3.2 Scene schema (`lib/schemas/scene.ts`)

```typescript
const SceneSchema = z.object({
  id: z.string(),
  background: AssetRefSchema,
  characters: z.array(SceneCharacterSchema).default([]),
  props: z.array(SceneLayerSchema).default([]),
  objects: z.array(SceneLayerSchema).default([]),
  speechBubbles: z.array(SceneLayerSchema).default([]),
  effects: z.array(SceneLayerSchema).default([]),
  dialogue: z.enum(["narration", "speech", "mixed", "none"]).default("narration"),
  animation: SceneAnimationSchema.optional(),  // Future — story content unchanged
});

const SceneCharacterSchema = z.object({
  id: z.string(),
  character: z.string(),                       // Asset ID: "leo", "pip", etc.
  pose: z.string(),
  expression: z.string().optional(),
  position: z.union([ScenePosition, SceneCoordinates]),
  transform: SceneTransformSchema.optional(),
  animation: SceneAnimationSchema.optional(),
});
```

### 9.4 `stories/bookNN/coach.json`

Wonder Together questions + Pip's Pocket reflection.

```typescript
const WonderQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  pipPrompt: z.string().optional(),           // Optional Pip aside for coach
});

const CoachSchema = z.object({
  version: z.literal(1),
  bookId: z.string(),
  wonder: z.object({
    intro: z.string().optional(),             // Optional intro before questions
    questions: z.array(WonderQuestionSchema).min(1),
  }),
  pocket: z.object({
    reflection: z.string().min(1),            // ONE takeaway — not a lesson
    pipLine: z.string().optional(),             // Pip's closing line
  }),
});
```

**Constraints enforced in UI copy review (not schema):**
- Questions must be open-ended (no yes/no scoring)
- Reflection must not use "you should", "always", "never", diagnostic language

### 9.5 `stories/bookNN/activity.json`

Play Together activity definition.

```typescript
const ActivityBase = z.object({
  version: z.literal(1),
  bookId: z.string(),
  title: z.string(),
  instructions: z.string(),                   // Shown once at top
});

const TapExploreActivity = ActivityBase.extend({
  type: z.literal("tap-explore"),
  hotspots: z.array(z.object({
    id: z.string(),
    label: z.string().optional(),
    x: z.number().min(0).max(100),            // Percent of illustration width
    y: z.number().min(0).max(100),
    revealText: z.string(),
    revealIllustration: z.string().optional(),
  })),
  background: z.string(),                       // Illustration path
});

const DragExploreActivity = ActivityBase.extend({
  type: z.literal("drag-explore"),
  items: z.array(z.object({
    id: z.string(),
    label: z.string(),
    illustration: z.string().optional(),
  })),
  zones: z.array(z.object({
    id: z.string(),
    label: z.string(),
    acceptAll: z.boolean().default(true),
    responseText: z.string(),
  })),
  background: z.string(),
});

const DrawSpaceActivity = ActivityBase.extend({
  type: z.literal("draw-space"),
  prompt: z.string(),
  background: z.string().optional(),
});

const ActivitySchema = z.discriminatedUnion("type", [
  TapExploreActivity,
  DragExploreActivity,
  DrawSpaceActivity,
]);
```

### 9.6 IndexedDB record shapes (not files)

```typescript
// Progress
{ bookId: string; pageIndex: number; completed: boolean; updatedAt: number }

// Settings
{ key: string; value: unknown }  // e.g. { key: "coachPinHash", value: "..." }

// Override
{ bookId: string; file: "story"|"coach"|"activity"|"meta"; json: object; updatedAt: number }
```

---

## 10. Scene Engine & Asset Library

### 10.1 Design principle

The application **does not assume one static illustration per page**. Each story page is a **Scene** that references reusable assets from the **Asset Library**. This enables:

- Reuse of characters, backgrounds, and props across books
- Consistent visual identity governed by the **CreatorBible**
- Future animation without changing story JSON content

### 10.2 Asset Library categories

| Category | Examples | Storage |
|----------|----------|---------|
| **Characters** | Leo, Pip, Dad, Mum, Whiskers | React SVG components + manifest entry |
| **Backgrounds** | Hallway, Leo's bedroom | `public/assets/backgrounds/*.svg` |
| **Props** | Cardboard box, spaceship, bricks | `public/assets/props/*.svg` |
| **Objects** | Green brick, radio, volcano | `public/assets/objects/*.svg` |
| **Speech bubbles** | Shout, whisper | `public/assets/speech-bubbles/*.svg` |
| **Effects** | Sparkle, giggle lines | `public/assets/effects/*.svg` |

### 10.3 CreatorBible

The `CreatorBible/` folder at the repository root stores **canonical world definitions**. This is NOT user-facing documentation — it is the single source of truth for every future illustration and story.

| File | Purpose |
|------|---------|
| `Leo.md` | Character appearance, poses, personality rules |
| `Pip.md` | Companion rules, backpack always present |
| `Dad.md`, `Mum.md` | Adult character definitions |
| `Whiskers.md` | Cat character |
| `World.md` | Locations and environment |
| `StoryRules.md` | Narrative constraints |
| `IllustrationRules.md` | Scene composition and layer ordering |
| `Objects.md` | Story object inventory |
| `ColourPalette.md` | Colour tokens (mirrors `lib/art/style.ts`) |

### 10.4 Scene composition pipeline

```
story.json (pages[].scene)
    ↓
Asset manifest (assets/manifest.json)
    ↓
SceneRenderer
    ├── Background layer (SVG image)
    ├── Objects & props (SVG images, positioned)
    ├── Characters (React SVG components, pose + expression)
    ├── Speech bubbles (SVG + optional text)
    └── Effects (SVG, animation-ready)
    ↓
StoryPage (scene + StoryText caption)
```

### 10.4.1 Layer ordering (bottom → top)

1. Background
2. Objects
3. Props
4. Characters
5. Speech bubbles
6. Effects

### 10.5 Animation readiness

Scenes include optional `animation` fields on characters, layers, and the scene itself. The Scene Engine resolves animation presets at render time:

| Preset | Behaviour |
|--------|-----------|
| `float` | Gentle vertical bob (Pip default) |
| `sparkle` | Effect pulse |
| `walk-in` | (Future) Character entrance |

**Story JSON never changes when new animations are added** — only the Scene Engine renderer gains new preset handlers.

### 10.6 Migration from flat illustrations

During migration, pages may define either `scene` or legacy `illustration`. `StoryPage` renders scenes via `SceneRenderer`; falls back to `StoryIllustration` for unmigrated pages.

### 10.7 Component responsibilities

| Component | Responsibility |
|-----------|----------------|
| `SceneRenderer` | Compose all scene layers into a comic panel |
| `useAssetManifest` | Fetch and cache Asset Library manifest |
| `lib/scene/position.ts` | Resolve position presets (`left`, `right`, etc.) |
| `lib/assets/loader.ts` | Server-side manifest loading |
| `app/api/assets/route.ts` | Serve manifest to client |

---

## 11. Story Engine

### 11.1 Responsibilities

`StoryEngine.tsx` + `lib/story/*`:

1. **Load** — Fetch book bundle via `loader.loadBook(bookId)`
2. **Validate** — Zod parse all JSON; surface friendly error in dev
3. **Merge** — Apply coach overrides from IndexedDB
4. **Render** — Current page scene (via Scene Engine) or legacy illustration + text
5. **Navigate** — Prev/next with Framer Motion transition from `story.transition`
6. **Persist** — Debounced write to IndexedDB on page change
7. **Complete** — Mark completed; route to `/story/[bookId]/wonder`

### 11.2 Loader API

```typescript
// lib/story/loader.ts
interface BookBundle {
  meta: BookMeta;
  story: Story;
  coach: Coach;
  activity: Activity;
}

function loadBook(bookId: string): Promise<BookBundle>;
function loadLibrary(): Promise<Library>;
function getLibraryAssetUrl(relativePath: string): string;
function getIllustrationUrl(bookId: string, relativePath: string): string;  // legacy
```

### 11.3 Progress API

```typescript
// lib/story/progress.ts
function getProgress(bookId: string): Promise<Progress | null>;
function saveProgress(bookId: string, pageIndex: number): Promise<void>;
function markCompleted(bookId: string): Promise<void>;
function getResumePage(bookId: string, totalPages: number): Promise<number>;
```

### 11.4 Page transition mapping

| `transition` value | Framer Motion variant |
|--------------------|----------------------|
| `fade` | Opacity crossfade (default — calmest) |
| `slide` | Horizontal slide 20px |
| `gentle-zoom` | Scale 0.98 → 1 |

All transitions: **duration 0.5–0.7s**, ease `[0.4, 0, 0.2, 1]`. No bouncy springs.

---

## 12. Storage Layer

### 12.1 Static content

- Committed to repo (or imported via Coach backup)
- Loaded at build time via dynamic imports or API route reading filesystem
- Illustrations: reusable assets in `public/assets/`; legacy flat SVGs in `public/stories/`

### 12.2 IndexedDB (Dexie)

Database name: `pips-backpack`

| Table | Primary key | Purpose |
|-------|-------------|---------|
| `progress` | `bookId` | Reading progress |
| `settings` | `key` | PIN hash, preferences |
| `overrides` | `[bookId+file]` | Coach edits |
| `drawings` | `id` | Optional saved draw-space artwork |

### 12.3 Coach backup format

Single JSON export:

```json
{
  "exportedAt": "2026-07-04T...",
  "library": { ... },
  "books": {
    "book01": {
      "meta": { ... },
      "story": { ... },
      "coach": { ... },
      "activity": { ... }
    }
  }
}
```

Illustrations exported separately as ZIP (future: include in backup).

---

## 13. Coach Mode

### 13.1 Entry

- **Hidden gesture:** Long-press (800ms) on Pip logo in footer → `/coach`
- Alternative: triple-tap on version string in settings area (accessibility note: also provide keyboard shortcut in coach docs)

### 13.2 Authentication

- PIN set on first coach visit (4–6 digits)
- Hashed with bcryptjs, stored in IndexedDB
- Session flag in sessionStorage after successful entry
- Auto-lock on tab close (sessionStorage cleared)

### 13.3 Capabilities

| Feature | Implementation |
|---------|----------------|
| Edit books | Override JSON in IndexedDB; optional future API write to filesystem |
| Add books | Generate new `bookNN` ID; append to library |
| Upload artwork | FileReader → store in overrides or public folder via API route |
| Edit questions | QuestionEditor → coach.json override |
| Edit activities | ActivityEditor → activity.json override |
| Export PDF | jspdf renders story pages + wonder questions |
| Backup library | Download JSON (+ ZIP for images) |

### 13.4 Security note

Client-side PIN is **obfuscation for child safety**, not enterprise security. Document this for stakeholders.

---

## 14. PWA & Offline Strategy

### 14.1 Manifest

- Name: "Pip's Backpack"
- `display: standalone`
- Warm theme colour: `#F5E6D3` (example — finalised in design tokens)
- Icons: 192, 512 PNG

### 14.2 Service worker

- Precache: app shell, `library.json`, asset manifest, all enabled books' JSON
- Runtime cache: asset library SVGs + legacy illustrations (cache-first)
- Offline fallback page with Pip illustration

### 14.3 Caching tiers

| Asset | Strategy |
|-------|----------|
| JS/CSS bundles | Precache |
| Story JSON | Precache per enabled book |
| Asset Library SVGs | Cache-first on first view |
| Legacy illustrations | Cache-first on first view |
| Narration audio (future) | Cache on demand |

---

## 15. Animation & Motion Guidelines

| Element | Motion | Duration |
|---------|--------|----------|
| Backpack float | `y: [0, -8, 0]` loop | 3s ease-in-out |
| Backpack open | Lid rotate + objects stagger fade-up | 1.2s once |
| Page transition | fade/slide per story config | 0.5–0.7s |
| Scene character float | `y: [0, -6, 0]` loop (Pip) | 2.5s ease-in-out |
| Scene effect sparkle | scale + opacity pulse | 1.5s loop |
| Button press | scale 0.97 | 0.15s |

**Reduced motion:** Respect `prefers-reduced-motion` — disable float, use instant transitions.

---

## 16. Accessibility & UX

- Minimum touch target: 44×44px
- Story text: 20px+ base on mobile; line-height 1.6
- Wonder questions: 28px+ 
- All illustrations: meaningful `alt` from page text (first sentence)
- Focus visible rings on interactive elements
- No time-limited interactions
- Colour contrast WCAG AA on text
- Language: plain, warm, British English default (localisation-ready)

### 16.1 Design tokens

```css
--color-cream: #FAF3E8;
--color-warm-brown: #5C4033;
--color-soft-blue: #7EB8DA;      /* Pip */
--color-golden: #F4C542;         /* Backpack accents */
--color-blush: #E8A598;
--color-outline: #3D2914;        /* Comic-book outlines */
--font-story: 'Nunito', sans-serif;
--radius-soft: 1.25rem;
--shadow-gentle: 0 4px 20px rgba(92, 64, 51, 0.12);
```

---

## 17. Future-Proofing

| Future need | Architectural hook |
|-------------|-------------------|
| **Localisation** | All UI strings in `lib/i18n/messages/`; story JSON gains `locale` folders (`book01/en/story.json`) |
| **Narration** | `narration` field on pages; `NarrationButton` + `<audio>` |
| **CMS** | JSON schemas match CMS collection shapes; loader unchanged |
| **Cloud sync** | Replace override write with API; `loader` accepts remote URL |
| **Multi-user child profiles** | Add `profileId` to progress table key |
| **Scene animation** | `animation` fields on scenes/layers; renderer adds presets without JSON changes |
| **Asset expansion** | Add entries to `assets/manifest.json` + CreatorBible; no engine refactor |

---

## 18. Development Phases

### Phase 1 — Foundation ✅
- Next.js scaffold, Tailwind tokens, folder structure
- Zod schemas + sample `book01` content
- Story Engine + basic routing

### Phase 2 — Core experience ✅
- Home animation + backpack object grid
- Wonder, Play, Pocket flows
- Progress persistence

### Phase 2.5 — Scene Engine ✅ (current)
- Asset Library manifest + reusable SVG assets
- Scene schema + SceneRenderer
- CreatorBible canonical definitions
- Migrate book01 to scene-based pages

### Phase 3 — Coach Mode
- PIN gate, editors, overrides, backup

### Phase 4 — PWA & polish
- Service worker, offline, reduced motion
- PDF export, artwork upload

### Phase 5 — Scale prep
- Book loader stress test (100 mock books)
- Documentation for content authors

---

## 19. Open Questions

Please confirm or adjust before implementation:

1. **Book ID format** — Is `book01`, `book02` acceptable, or prefer slugs (`volcano-feelings`)?
2. **Initial book count** — How many complete stories for v1 launch?
3. **Reference artwork** — Will you supply illustration files for book01, or should we use placeholders?
4. **Coach PIN recovery** — Reset via backup file only, or security question?
5. **Target devices** — Tablet-first (iPad) or equal phone/tablet/desktop?
6. **British vs American English** — Default locale?
7. **Play Together complexity** — Start with `tap-explore` only, or all three activity types?
8. **Hidden coach entry** — Long-press logo acceptable, or prefer a different gesture?
9. **Deployment target** — Vercel static export, Node server, or Electron wrapper?
10. **Auth for cloud sync (future)** — Any preferred provider (Supabase, Firebase)?

---

## Approval

Architecture v2.0 approved with Scene Engine + Asset Library + CreatorBible.

Implementation in progress on branch `cursor/scene-engine-2ab3`.

---

*Document authored for Pip's Backpack — therapeutic storytelling platform.*
