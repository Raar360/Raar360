# Pip's Backpack — Technical Architecture

> **Status:** Draft for review  
> **Version:** 1.0  
> **Last updated:** 2026-07-04

This document defines the complete technical architecture for *Pip's Backpack* — a therapeutic storytelling platform for children and their coaches/parents. **No application code should be written until this document is approved.**

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
10. [Story Engine](#10-story-engine)
11. [Storage Layer](#11-storage-layer)
12. [Coach Mode](#12-coach-mode)
13. [PWA & Offline Strategy](#13-pwa--offline-strategy)
14. [Animation & Motion Guidelines](#14-animation--motion-guidelines)
15. [Accessibility & UX](#15-accessibility--ux)
16. [Future-Proofing](#16-future-proofing)
17. [Development Phases](#17-development-phases)
18. [Open Questions](#18-open-questions)

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
3. Story Engine loads `story.json`, renders pages with illustrations
4. On completion → Wonder Together (`coach.json` questions)
5. → Play Together (`activity.json`)
6. → Pip's Pocket (reflection from `coach.json`)
7. Progress persisted to IndexedDB after each page

---

## 5. Folder Structure

```
pip-backpack/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout, fonts, providers
│   ├── page.tsx                      # Home (animated backpack)
│   ├── globals.css                   # Tailwind + design tokens
│   ├── manifest.ts                   # PWA manifest (or public/manifest.json)
│   │
│   ├── backpack/
│   │   └── page.tsx                  # Pip's Backpack (object grid)
│   │
│   ├── story/
│   │   └── [bookId]/
│   │       ├── page.tsx              # Story reader entry
│   │       ├── wonder/page.tsx       # Wonder Together
│   │       ├── play/page.tsx         # Play Together
│   │       └── pocket/page.tsx       # Pip's Pocket
│   │
│   └── coach/
│       ├── page.tsx                  # PIN gate
│       ├── library/page.tsx          # Book list management
│       ├── [bookId]/
│       │   ├── story/page.tsx        # Edit story pages
│       │   ├── wonder/page.tsx       # Edit questions
│       │   ├── play/page.tsx         # Edit activity
│       │   └── pocket/page.tsx       # Edit reflection
│       └── settings/page.tsx         # PIN change, backup, export
│
├── components/
│   ├── ui/                           # Primitives (no business logic)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Typography.tsx
│   │   ├── SafeArea.tsx
│   │   ├── IconButton.tsx
│   │   └── ProgressDots.tsx
│   │
│   ├── layout/
│   │   ├── AppShell.tsx              # Max-width, padding, background
│   │   ├── PageTransition.tsx        # Framer Motion wrapper
│   │   └── BackButton.tsx
│   │
│   ├── characters/
│   │   ├── Pip.tsx                   # Pip companion (expressions)
│   │   └── Leo.tsx                   # Leo avatar (where needed)
│   │
│   ├── home/
│   │   ├── AnimatedBackpack.tsx      # Hero backpack + float animation
│   │   └── BackpackReveal.tsx        # Opening animation → objects emerge
│   │
│   ├── library/
│   │   ├── StoryObject.tsx           # Single object tile (brick, radio…)
│   │   └── StoryObjectGrid.tsx       # Grid of objects
│   │
│   ├── story/
│   │   ├── StoryEngine.tsx           # Core reader orchestrator
│   │   ├── StoryPage.tsx             # Single page layout
│   │   ├── StoryIllustration.tsx     # Image + loading/fallback
│   │   ├── StoryText.tsx             # Story copy typography
│   │   ├── StoryControls.tsx         # Prev / Next (no timer)
│   │   ├── StoryProgress.tsx         # Subtle progress (dots, not %)
│   │   └── NarrationButton.tsx       # Future: play narration audio
│   │
│   ├── wonder/
│   │   ├── WonderCard.tsx            # One question per screen
│   │   └── WonderCarousel.tsx        # Swipe/tap through questions
│   │
│   ├── play/
│   │   ├── ActivityRenderer.tsx      # Dispatches by activity type
│   │   └── activities/
│   │       ├── TapExplore.tsx        # Tap hotspots, no score
│   │       ├── DragExplore.tsx       # Drag items, no fail state
│   │       └── DrawSpace.tsx         # Free draw canvas
│   │
│   ├── pocket/
│   │   ├── PocketReflection.tsx      # Single takeaway display
│   │   └── PipPocket.tsx             # Pip + reflection layout
│   │
│   └── coach/
│       ├── PinGate.tsx
│       ├── BookEditor.tsx
│       ├── PageEditor.tsx
│       ├── QuestionEditor.tsx
│       ├── ActivityEditor.tsx
│       ├── ArtworkUploader.tsx
│       ├── LibraryBackup.tsx
│       └── PdfExport.tsx
│
├── lib/
│   ├── schemas/                      # Zod schemas (source of truth)
│   │   ├── library.ts
│   │   ├── story.ts
│   │   ├── coach.ts
│   │   ├── activity.ts
│   │   └── index.ts
│   │
│   ├── story/
│   │   ├── loader.ts                 # Load & validate book bundle
│   │   ├── registry.ts               # bookId → metadata map
│   │   └── progress.ts               # Read/write page progress
│   │
│   ├── storage/
│   │   ├── db.ts                     # Dexie database definition
│   │   ├── settings.ts               # App settings, coach PIN
│   │   └── overrides.ts              # Coach edits overlay JSON
│   │
│   ├── coach/
│   │   ├── auth.ts                   # PIN verify/set
│   │   ├── export.ts                 # Backup JSON zip
│   │   └── pdf.ts                    # PDF generation
│   │
│   ├── i18n/
│   │   ├── config.ts
│   │   └── messages/
│   │       └── en.json               # Stub for future locales
│   │
│   └── utils/
│       ├── cn.ts                     # clsx + tailwind-merge
│       ├── assets.ts                   # Illustration path helpers
│       └── motion.ts                   # Shared motion variants
│
├── stories/                          # Content root (100+ books)
│   ├── library.json                  # Master index + object mapping
│   │
│   └── book01/                       # Example book folder
│       ├── meta.json                 # Title, object type, sort order
│       ├── story.json                # Pages, text, illustration refs
│       ├── coach.json                # Wonder questions + pocket reflection
│       ├── activity.json             # Play Together definition
│       └── illustrations/
│           ├── page-01.webp
│           ├── page-02.webp
│           └── object-icon.webp      # Backpack grid icon
│
├── public/
│   ├── icons/                        # PWA icons
│   ├── characters/                   # Shared Pip/Leo SVG components assets
│   └── fonts/                        # Optional custom fonts
│
├── types/
│   └── index.ts                      # Inferred types from Zod (re-exports)
│
├── docs/
│   └── ARCHITECTURE.md               # This document
│
├── tests/
│   ├── schemas/                      # Schema validation tests
│   ├── story/                        # Loader & progress tests
│   └── components/                   # Component smoke tests
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 5.1 Folder rationale

| Folder | Responsibility |
|--------|----------------|
| `app/` | Routes only — thin pages that compose feature components |
| `components/` | All UI; grouped by feature domain |
| `lib/` | Pure logic: loading, validation, storage, no JSX (except none) |
| `stories/` | **Content as data** — the only place story copy/images live |
| `public/` | Static assets not tied to a specific book |
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

Core story definition.

```typescript
const StoryPageSchema = z.object({
  id: z.string(),                             // Stable ID for progress
  illustration: z.string(),                   // Relative: "illustrations/page-01.webp"
  text: z.string().min(1),
  narration: z.string().optional(),           // Relative path to audio file (future)
  pipExpression: z.enum(["neutral", "curious", "excited", "gentle"]).optional(),
});

const StorySchema = z.object({
  version: z.literal(1),
  bookId: z.string(),
  pages: z.array(StoryPageSchema).min(1),
  transition: z.enum(["fade", "slide", "gentle-zoom"]).default("fade"),
});
```

**Example page:**

```json
{
  "id": "page-03",
  "illustration": "illustrations/page-03.webp",
  "text": "Leo felt something warm rising inside him, like a tiny volcano waking up.",
  "pipExpression": "curious"
}
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

## 10. Story Engine

### 10.1 Responsibilities

`StoryEngine.tsx` + `lib/story/*`:

1. **Load** — Fetch book bundle via `loader.loadBook(bookId)`
2. **Validate** — Zod parse all JSON; surface friendly error in dev
3. **Merge** — Apply coach overrides from IndexedDB
4. **Render** — Current page illustration + text
5. **Navigate** — Prev/next with Framer Motion transition from `story.transition`
6. **Persist** — Debounced write to IndexedDB on page change
7. **Complete** — Mark completed; route to `/story/[bookId]/wonder`

### 10.2 Loader API

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
function getIllustrationUrl(bookId: string, relativePath: string): string;
```

### 10.3 Progress API

```typescript
// lib/story/progress.ts
function getProgress(bookId: string): Promise<Progress | null>;
function saveProgress(bookId: string, pageIndex: number): Promise<void>;
function markCompleted(bookId: string): Promise<void>;
function getResumePage(bookId: string, totalPages: number): Promise<number>;
```

### 10.4 Page transition mapping

| `transition` value | Framer Motion variant |
|--------------------|----------------------|
| `fade` | Opacity crossfade (default — calmest) |
| `slide` | Horizontal slide 20px |
| `gentle-zoom` | Scale 0.98 → 1 |

All transitions: **duration 0.5–0.7s**, ease `[0.4, 0, 0.2, 1]`. No bouncy springs.

---

## 11. Storage Layer

### 11.1 Static content (`stories/`)

- Committed to repo (or imported via Coach backup)
- Loaded at build time via dynamic imports or API route reading filesystem
- Illustrations as WebP (optimized, consistent aspect ~4:5 portrait)

### 11.2 IndexedDB (Dexie)

Database name: `pips-backpack`

| Table | Primary key | Purpose |
|-------|-------------|---------|
| `progress` | `bookId` | Reading progress |
| `settings` | `key` | PIN hash, preferences |
| `overrides` | `[bookId+file]` | Coach edits |
| `drawings` | `id` | Optional saved draw-space artwork |

### 11.3 Coach backup format

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

## 12. Coach Mode

### 12.1 Entry

- **Hidden gesture:** Long-press (800ms) on Pip logo in footer → `/coach`
- Alternative: triple-tap on version string in settings area (accessibility note: also provide keyboard shortcut in coach docs)

### 12.2 Authentication

- PIN set on first coach visit (4–6 digits)
- Hashed with bcryptjs, stored in IndexedDB
- Session flag in sessionStorage after successful entry
- Auto-lock on tab close (sessionStorage cleared)

### 12.3 Capabilities

| Feature | Implementation |
|---------|----------------|
| Edit books | Override JSON in IndexedDB; optional future API write to filesystem |
| Add books | Generate new `bookNN` ID; append to library |
| Upload artwork | FileReader → store in overrides or public folder via API route |
| Edit questions | QuestionEditor → coach.json override |
| Edit activities | ActivityEditor → activity.json override |
| Export PDF | jspdf renders story pages + wonder questions |
| Backup library | Download JSON (+ ZIP for images) |

### 12.4 Security note

Client-side PIN is **obfuscation for child safety**, not enterprise security. Document this for stakeholders.

---

## 13. PWA & Offline Strategy

### 13.1 Manifest

- Name: "Pip's Backpack"
- `display: standalone`
- Warm theme colour: `#F5E6D3` (example — finalised in design tokens)
- Icons: 192, 512 PNG

### 13.2 Service worker

- Precache: app shell, `library.json`, all enabled books' JSON
- Runtime cache: illustrations (cache-first, max age 30 days)
- Offline fallback page with Pip illustration

### 13.3 Caching tiers

| Asset | Strategy |
|-------|----------|
| JS/CSS bundles | Precache |
| Story JSON | Precache per enabled book |
| Illustrations | Cache-first on first view |
| Narration audio (future) | Cache on demand |

---

## 14. Animation & Motion Guidelines

| Element | Motion | Duration |
|---------|--------|----------|
| Backpack float | `y: [0, -8, 0]` loop | 3s ease-in-out |
| Backpack open | Lid rotate + objects stagger fade-up | 1.2s once |
| Page transition | fade/slide per story config | 0.5–0.7s |
| Pip blink | occasional subtle | random 4–8s |
| Button press | scale 0.97 | 0.15s |

**Reduced motion:** Respect `prefers-reduced-motion` — disable float, use instant transitions.

---

## 15. Accessibility & UX

- Minimum touch target: 44×44px
- Story text: 20px+ base on mobile; line-height 1.6
- Wonder questions: 28px+ 
- All illustrations: meaningful `alt` from page text (first sentence)
- Focus visible rings on interactive elements
- No time-limited interactions
- Colour contrast WCAG AA on text
- Language: plain, warm, British English default (localisation-ready)

### 15.1 Design tokens (Tailwind CSS variables)

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

## 16. Future-Proofing

| Future need | Architectural hook |
|-------------|-------------------|
| **Localisation** | All UI strings in `lib/i18n/messages/`; story JSON gains `locale` folders (`book01/en/story.json`) |
| **Narration** | `narration` field on pages; `NarrationButton` + `<audio>` |
| **CMS** | JSON schemas match CMS collection shapes; loader unchanged |
| **Cloud sync** | Replace override write with API; `loader` accepts remote URL |
| **Multi-user child profiles** | Add `profileId` to progress table key |
| **Analytics-free usage** | No analytics SDK; optional coach export for session notes |

---

## 17. Development Phases

### Phase 1 — Foundation (after approval)
- Next.js scaffold, Tailwind tokens, folder structure
- Zod schemas + sample `book01` content
- Story Engine + basic routing

### Phase 2 — Core experience
- Home animation + backpack object grid
- Wonder, Play, Pocket flows
- Progress persistence

### Phase 3 — Coach Mode
- PIN gate, editors, overrides, backup

### Phase 4 — PWA & polish
- Service worker, offline, reduced motion
- PDF export, artwork upload

### Phase 5 — Scale prep
- Book loader stress test (100 mock books)
- Documentation for content authors

---

## 18. Open Questions

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

Once this architecture is approved, implementation will begin with **Phase 1** on branch `cursor/initial-scaffold-989b`.

**Please review and reply with:**
- Approved as-is, or
- Changes to specific sections, or
- Answers to open questions

---

*Document authored for Pip's Backpack — therapeutic storytelling platform.*
