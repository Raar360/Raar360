# Pip's Backpack — Technical Architecture

> **Status:** Draft for review  
> **Version:** 0.1.0  
> **Last updated:** 2026-07-04

This document defines the complete technical architecture for **Pip's Backpack**, a therapeutic storytelling platform for children. No application code should be written until this document is approved.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Principles](#2-design-principles)
3. [Technology Stack](#3-technology-stack)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Application Flow & Routing](#6-application-flow--routing)
7. [Component Architecture](#7-component-architecture)
8. [JSON Schemas](#8-json-schemas)
9. [State & Storage](#9-state--storage)
10. [Story Engine](#10-story-engine)
11. [Wonder Together, Play Together, Pip's Pocket](#11-wonder-together-play-together-pips-pocket)
12. [Coach Mode](#12-coach-mode)
13. [PWA & Offline Strategy](#13-pwa--offline-strategy)
14. [Styling & Motion System](#14-styling--motion-system)
15. [Future Extensibility](#15-future-extensibility)
16. [Testing Strategy](#16-testing-strategy)
17. [Build & Deployment](#17-build--deployment)
18. [Open Questions for Approval](#18-open-questions-for-approval)

---

## 1. Executive Summary

Pip's Backpack is a **data-driven, offline-capable PWA** built with Next.js, React, TypeScript, TailwindCSS, and Framer Motion. All story content lives in JSON files under `/stories`, making the platform scalable to 100+ books without code changes.

The application serves two personas:

| Persona | Access | Purpose |
|---------|--------|---------|
| **Child** | Default | Read stories, explore activities, feel recognised |
| **Coach / Parent** | Hidden PIN | Edit content, export, backup |

The user journey is linear but non-punitive:

```
Home → Pip's Backpack → Choose Story → Story → Wonder Together → Play Together → Pip's Pocket
```

Every screen is designed to feel **calm, warm, magical, and safe**. There are no scores, timers, achievements, ads, or addictive mechanics.

---

## 2. Design Principles

These principles govern every architectural decision:

| Principle | Implementation |
|-----------|----------------|
| **Data over code** | Stories, questions, activities, and reflections are JSON — never hardcoded |
| **Recognition, not teaching** | Copy and UI never label, diagnose, or moralise |
| **Calm UX** | Soft animations, generous whitespace, no urgency |
| **Offline first** | All content cached; progress stored locally |
| **Scale to 100+ books** | Catalog index, lazy loading, content provider abstraction |
| **Editable everything** | Coach mode can modify all content fields |
| **Future-proof** | Schemas reserve fields for i18n, narration, CMS, cloud sync |

---

## 3. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 15 (App Router)** | File-based routing, static export option, PWA support, React Server Components for catalog loading |
| Language | **TypeScript (strict)** | Schema safety, refactor confidence at scale |
| Styling | **TailwindCSS v4** | Design tokens, responsive utilities, minimal CSS surface |
| Animation | **Framer Motion** | Gentle page transitions, backpack float, object reveals |
| Validation | **Zod** | Runtime JSON validation in dev + coach save paths |
| Local storage | **IndexedDB via `idb`** | Structured progress, coach drafts, larger than localStorage |
| PWA | **`@ducanh2912/next-pwa`** | Service worker, offline caching, install prompt |
| PDF export | **`@react-pdf/renderer`** (coach only) | Client-side PDF generation for backup/sharing |
| Icons / assets | **SVG + WebP** | Crisp illustrations, small bundle |

### Deliberate exclusions

- No Redux/Zustand global store — React context + IndexedDB is sufficient
- No authentication server — coach PIN is local-only (v1)
- No database — JSON files are the source of truth (v1)
- No analytics SDK — conflicts with therapeutic safety goals

---

## 4. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   Home   │ │  Story   │ │  Wonder  │ │   Play   │  ...      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                   │
│       └────────────┴────────────┴────────────┘                   │
│                         │                                          │
│              ┌──────────▼──────────┐                               │
│              │   React Components   │                               │
│              │  (StoryEngine, etc.) │                               │
│              └──────────┬──────────┘                               │
│                         │                                          │
│       ┌─────────────────┼─────────────────┐                       │
│       │                 │                 │                       │
│  ┌────▼────┐     ┌──────▼──────┐   ┌─────▼─────┐                  │
│  │  Hooks  │     │  lib/types  │   │ lib/storage│                  │
│  └────┬────┘     └──────┬──────┘   └─────┬─────┘                  │
│       │                 │                 │                       │
│       └─────────────────┼─────────────────┘                       │
│                         │                                          │
│              ┌──────────▼──────────┐                               │
│              │  ContentProvider    │  ← abstraction for future CMS │
│              │  (LocalJsonProvider)│                               │
│              └──────────┬──────────┘                               │
│                         │                                          │
│              ┌──────────▼──────────┐                               │
│              │   /stories/*.json   │                               │
│              │   /illustrations/*  │                               │
│              └─────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### Content Provider Pattern

All book data flows through a single interface so we can swap local JSON for a CMS later without touching UI components:

```typescript
interface ContentProvider {
  getCatalog(): Promise<Catalog>;
  getBook(bookId: string): Promise<BookBundle>;
  saveBook(bookId: string, bundle: BookBundle): Promise<void>; // coach only
}
```

`LocalJsonProvider` (v1) reads from `/stories`. `CmsProvider` (future) fetches from an API.

---

## 5. Folder Structure

Every folder, file, and its purpose:

```
pips-backpack/
│
├── app/                              # Next.js App Router — routes only, thin pages
│   ├── layout.tsx                    # Root layout: fonts, theme, providers, PWA meta
│   ├── page.tsx                      # Home screen — animated backpack
│   ├── globals.css                   # Tailwind imports + CSS custom properties (design tokens)
│   ├── manifest.ts                   # Web app manifest (name, icons, theme colour)
│   │
│   ├── backpack/
│   │   └── page.tsx                  # "Pip's Backpack" — object selection grid
│   │
│   ├── story/
│   │   └── [bookId]/
│   │       └── page.tsx              # Story reader (StoryEngine wrapper)
│   │
│   ├── wonder/
│   │   └── [bookId]/
│   │       └── page.tsx              # Wonder Together question cards
│   │
│   ├── play/
│   │   └── [bookId]/
│   │       └── page.tsx              # Play Together activity
│   │
│   ├── pocket/
│   │   └── [bookId]/
│   │       └── page.tsx              # Pip's Pocket reflection
│   │
│   └── coach/
│       ├── page.tsx                  # Coach dashboard (PIN gated)
│       ├── books/
│       │   ├── page.tsx              # Book list + add new
│       │   └── [bookId]/
│       │       └── page.tsx          # Book editor (story, wonder, play, pocket)
│       └── settings/
│           └── page.tsx              # PIN change, export, backup
│
├── components/                       # All reusable UI — no business logic in pages
│   │
│   ├── layout/
│   │   ├── AppShell.tsx              # Max-width container, safe-area padding, background
│   │   ├── ScreenWrapper.tsx         # Consistent vertical rhythm per screen type
│   │   ├── BackButton.tsx            # Gentle back navigation (never "exit")
│   │   └── PageTransition.tsx        # Framer Motion wrapper for route transitions
│   │
│   ├── home/
│   │   ├── AnimatedBackpack.tsx      # Large floating backpack with open/close state
│   │   ├── BackpackLid.tsx           # Lid animation segment
│   │   └── FloatingObject.tsx        # Individual story object (pre-selection teaser)
│   │
│   ├── backpack/
│   │   ├── ObjectGrid.tsx            # Grid of selectable story objects
│   │   ├── StoryObject.tsx           # Single object card (icon + subtle label)
│   │   └── ObjectIcon.tsx            # SVG/icon renderer per object type
│   │
│   ├── story/
│   │   ├── StoryEngine.tsx           # ★ Core reusable story component
│   │   ├── StoryPage.tsx             # Single page: illustration + text layout
│   │   ├── StoryIllustration.tsx     # Full-bleed illustration with lazy load
│   │   ├── StoryText.tsx             # Story copy with accessible typography
│   │   ├── StoryNavigation.tsx       # Prev/next tap zones (no page numbers shown to child)
│   │   ├── StoryProgressBar.tsx      # Subtle progress indicator (optional, coach toggle)
│   │   └── NarrationButton.tsx       # Placeholder for future audio (hidden if no narration)
│   │
│   ├── wonder/
│   │   ├── WonderTogether.tsx        # Question card flow controller
│   │   ├── QuestionCard.tsx          # One question per screen, large type
│   │   └── QuestionProgress.tsx      # Dot indicator (no numbers)
│   │
│   ├── play/
│   │   ├── PlayTogether.tsx          # Activity router — picks component by type
│   │   └── activities/
│   │       ├── TapExplore.tsx        # Tap hotspots on illustration
│   │       ├── SortItems.tsx         # Gentle drag-to-group (no fail state)
│   │       ├── ColourPicker.tsx      # Choose colours freely
│   │       ├── DrawCanvas.tsx        # Free draw zone
│   │       └── CustomActivity.tsx    # Fallback for unknown types
│   │
│   ├── pocket/
│   │   ├── PipsPocket.tsx            # Reflection screen controller
│   │   ├── ReflectionCard.tsx        # Single takeaway display
│   │   └── PipCharacter.tsx          # Pip illustration with backpack
│   │
│   ├── characters/
│   │   ├── Leo.tsx                   # Leo character asset component
│   │   └── Pip.tsx                   # Pip character asset component
│   │
│   ├── coach/
│   │   ├── PinGate.tsx               # PIN entry overlay
│   │   ├── CoachShell.tsx            # Coach layout with nav sidebar
│   │   ├── BookList.tsx              # All books with edit/delete
│   │   ├── BookEditor.tsx            # Tabbed editor: story / wonder / play / pocket / meta
│   │   ├── StoryPageEditor.tsx       # Edit individual story pages
│   │   ├── QuestionEditor.tsx        # Edit wonder questions
│   │   ├── ActivityEditor.tsx        # Edit play activity JSON visually
│   │   ├── IllustrationUploader.tsx  # Upload/replace illustration files
│   │   ├── JsonPreview.tsx           # Raw JSON view for power users
│   │   ├── ExportPdfButton.tsx       # Generate printable PDF of a book
│   │   └── BackupLibraryButton.tsx   # Download full stories/ zip
│   │
│   └── ui/
│       ├── Button.tsx                # Primary / ghost / icon variants
│       ├── Typography.tsx            # Heading, Body, Whisper text scales
│       ├── Card.tsx                  # Soft rounded card
│       ├── Modal.tsx                 # Gentle overlay (coach only)
│       ├── Spinner.tsx               # Calm loading indicator
│       └── VisuallyHidden.tsx        # Accessibility helper
│
├── lib/                              # Non-UI logic — pure TypeScript
│   │
│   ├── types/
│   │   ├── catalog.ts                # Catalog, BookMeta, HomeObject types
│   │   ├── story.ts                  # Story, StoryPage types
│   │   ├── coach.ts                  # CoachData, Question types
│   │   ├── activity.ts               # Activity, ActivityConfig types
│   │   ├── pocket.ts                 # Pocket reflection types
│   │   └── index.ts                  # Re-exports
│   │
│   ├── schemas/                      # Zod schemas mirroring types/
│   │   ├── catalog.schema.ts
│   │   ├── story.schema.ts
│   │   ├── coach.schema.ts
│   │   ├── activity.schema.ts
│   │   └── index.ts
│   │
│   ├── content/
│   │   ├── ContentProvider.ts        # Interface definition
│   │   ├── LocalJsonProvider.ts      # Reads /stories JSON files
│   │   └── paths.ts                  # URL builders for illustrations, audio
│   │
│   ├── storage/
│   │   ├── db.ts                     # IndexedDB setup (idb)
│   │   ├── progress.ts               # Read/write story progress per book
│   │   ├── journey.ts                # Track wonder/play/pocket completion
│   │   └── coach-auth.ts             # PIN hash storage (local only)
│   │
│   ├── hooks/
│   │   ├── useBook.ts                # Load full book bundle
│   │   ├── useCatalog.ts             # Load catalog index
│   │   ├── useStoryProgress.ts       # Current page + save on change
│   │   ├── useJourney.ts             # Post-story flow state
│   │   ├── useCoachMode.ts             # PIN auth state
│   │   └── useOfflineStatus.ts       # Online/offline indicator (coach only)
│   │
│   ├── motion/
│   │   ├── variants.ts               # Shared Framer Motion variants
│   │   └── transitions.ts            # Duration/easing constants (slow, gentle)
│   │
│   ├── pdf/
│   │   └── generateBookPdf.ts        # PDF export logic
│   │
│   ├── backup/
│   │   └── exportLibrary.ts          # Zip all stories for backup
│   │
│   └── constants/
│       ├── home-objects.ts           # Canonical list of 9 home objects
│       ├── design-tokens.ts          # Colours, spacing (mirrors CSS vars)
│       └── defaults.ts               # Default PIN, animation durations
│
├── stories/                          # ★ All book content — the data layer
│   ├── catalog.json                  # Master index of all books
│   │
│   ├── book01/
│   │   ├── meta.json                 # Book metadata + home object mapping
│   │   ├── story.json                # Story pages
│   │   ├── coach.json                # Wonder Together questions
│   │   ├── activity.json             # Play Together activity
│   │   ├── pocket.json               # Pip's Pocket reflection
│   │   └── illustrations/
│   │       ├── cover.webp
│   │       ├── page-01.webp
│   │       ├── page-02.webp
│   │       └── ...
│   │
│   ├── book02/
│   │   └── ... (same structure)
│   │
│   └── _template/                    # Scaffold for new books (coach "Add book")
│       ├── meta.json
│       ├── story.json
│       ├── coach.json
│       ├── activity.json
│       ├── pocket.json
│       └── illustrations/
│           └── .gitkeep
│
├── public/
│   ├── icons/                        # PWA icons (192, 512, maskable)
│   ├── fonts/                        # Self-hosted warm rounded font (e.g. Nunito)
│   └── assets/
│       ├── backpack/                 # Shared backpack SVG layers
│       ├── characters/               # Leo & Pip base assets
│       └── objects/                  # Home object icons (brick, radio, wall, etc.)
│
├── scripts/
│   ├── validate-stories.ts           # CI: validate all JSON against Zod schemas
│   ├── scaffold-book.ts              # CLI: create new book from template
│   └── generate-catalog.ts           # Rebuild catalog.json from book folders
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── ARCHITECTURE.md                   # This document
```

### Why this structure?

| Decision | Reason |
|----------|--------|
| **`app/` pages are thin** | Pages only fetch params and render one component — easy to test components in isolation |
| **`stories/` at repo root** | Content is first-class, version-controlled, and portable for backup/CMS migration |
| **`pocket.json` separate from `coach.json`** | Wonder (discussion) and Pocket (reflection) have different UX and edit workflows |
| **`meta.json` per book** | Home object mapping and catalog fields without bloating story.json |
| **`_template/` folder** | Coach "Add book" copies this scaffold |
| **`lib/content/ContentProvider`** | Single seam for future CMS/cloud without rewriting components |

---

## 6. Application Flow & Routing

### Route map

| Route | Screen | Component |
|-------|--------|-----------|
| `/` | Home | `AnimatedBackpack` |
| `/backpack` | Choose Story | `ObjectGrid` |
| `/story/[bookId]` | Story | `StoryEngine` |
| `/wonder/[bookId]` | Wonder Together | `WonderTogether` |
| `/play/[bookId]` | Play Together | `PlayTogether` |
| `/pocket/[bookId]` | Pip's Pocket | `PipsPocket` |
| `/coach` | Coach dashboard | `CoachShell` (PIN gated) |
| `/coach/books/[bookId]` | Book editor | `BookEditor` |

### Journey state machine

Each book tracks a **journey phase** in IndexedDB:

```
not_started → story → wonder → play → pocket → complete
```

- Child can always re-read a story (no lock-out)
- Post-story sections appear in order but skipping back is allowed
- Completing pocket returns to `/backpack` with a gentle "Pip found something new" animation (not a reward/badge)

### Navigation rules

- **No browser chrome emphasis** — fullscreen-friendly PWA
- **Back button** returns one step, never exits abruptly
- **No deep links required for v1** — but routes are bookmarkable for coaches
- **Story page index** stored in IndexedDB, not URL (cleaner URLs, no "page 7" anxiety)

---

## 7. Component Architecture

### Component hierarchy (Story flow example)

```
app/story/[bookId]/page.tsx
└── StoryEngine                    # Orchestrator
    ├── StoryPage                  # Current page layout
    │   ├── StoryIllustration      # Image
    │   └── StoryText              # Copy
    ├── StoryNavigation            # Tap left/right
    ├── StoryProgressBar           # Optional subtle bar
    └── NarrationButton            # Future
```

### Component responsibilities

| Component | Responsibility | Does NOT |
|-----------|----------------|----------|
| `StoryEngine` | Load JSON, manage page index, persist progress, emit "story complete" | Render illustration details |
| `StoryPage` | Layout ratio (illustration dominant), responsive breakpoints | Fetch data |
| `WonderTogether` | Paginate questions, track current index | Validate answers |
| `PlayTogether` | Resolve activity type → render activity component | Score or fail |
| `PipsPocket` | Show reflection + takeaway | Summarise or teach |
| `AnimatedBackpack` | Home hero animation, link to `/backpack` | List all objects inline |

### Shared providers (React Context)

```typescript
// app/layout.tsx wraps children with:
<ContentProvider>      // book data access
  <ProgressProvider>   // IndexedDB progress
    <MotionProvider>   // reduced-motion preference
      {children}
    </MotionProvider>
  </ProgressProvider>
</ContentProvider>
```

---

## 8. JSON Schemas

All schemas are validated with Zod at build time (CI script) and at coach save time.

### 8.1 `stories/catalog.json`

Master index for home screen and book discovery.

```json
{
  "version": 1,
  "books": [
    {
      "id": "book01",
      "title": "The Green Brick",
      "subtitle": "A story about trying your best",
      "homeObjectId": "green-brick",
      "coverIllustration": "book01/illustrations/cover.webp",
      "sortOrder": 1,
      "published": true,
      "locale": "en"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | number | yes | Schema version for migrations |
| `books[].id` | string | yes | Unique slug, matches folder name |
| `books[].title` | string | yes | Display title |
| `books[].subtitle` | string | no | Soft descriptor (never moralising) |
| `books[].homeObjectId` | string | yes | One of 9 canonical object IDs |
| `books[].coverIllustration` | string | yes | Path relative to `/stories` |
| `books[].sortOrder` | number | yes | Display order in backpack |
| `books[].published` | boolean | yes | Hidden from child if false |
| `books[].locale` | string | yes | Primary locale (future i18n) |

---

### 8.2 `stories/bookXX/meta.json`

Extended metadata not needed during story reading.

```json
{
  "id": "book01",
  "createdAt": "2026-01-15T00:00:00Z",
  "updatedAt": "2026-03-01T00:00:00Z",
  "author": "Pip's Backpack Team",
  "tags": ["trying", "school"],
  "characters": ["leo", "pip"],
  "estimatedMinutes": 8,
  "homeObject": {
    "id": "green-brick",
    "label": "Green Brick",
    "description": "A small green building block",
    "iconPath": "/assets/objects/green-brick.svg"
  }
}
```

---

### 8.3 `stories/bookXX/story.json`

The core story definition.

```json
{
  "version": 1,
  "bookId": "book01",
  "title": "The Green Brick",
  "pages": [
    {
      "id": "page-01",
      "illustration": "illustrations/page-01.webp",
      "text": "Leo sat on the carpet, turning a green brick over in his hands.",
      "narration": null,
      "transition": "fade"
    },
    {
      "id": "page-02",
      "illustration": "illustrations/page-02.webp",
      "text": "Pip peeked out of the backpack. \"That brick looks interesting,\" Pip whispered.",
      "narration": {
        "src": "audio/page-02.mp3",
        "durationMs": 4200
      },
      "transition": "slide"
    }
  ],
  "settings": {
    "showProgressBar": false,
    "allowSwipeNavigation": true,
    "autoAdvanceMs": null
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pages[].id` | string | yes | Stable ID for progress tracking |
| `pages[].illustration` | string | yes | Path relative to book folder |
| `pages[].text` | string | yes | Story copy (plain text, no HTML) |
| `pages[].narration` | object \| null | no | Future audio; null hides play button |
| `pages[].narration.src` | string | yes* | Audio file path |
| `pages[].narration.durationMs` | number | yes* | For progress UI |
| `pages[].transition` | enum | no | `fade` \| `slide` \| `none` (default: `fade`) |
| `settings.showProgressBar` | boolean | no | Coach can enable for sessions |
| `settings.allowSwipeNavigation` | boolean | no | Touch swipe between pages |
| `settings.autoAdvanceMs` | number \| null | no | Reserved; default null (no auto-advance) |

**Story writing rules (enforced in coach editor warnings, not schema):**
- Leo never intentionally naughty
- Pip notices, never blames
- No moral at end of story text

---

### 8.4 `stories/bookXX/coach.json`

Wonder Together questions for coach/parent discussion.

```json
{
  "version": 1,
  "bookId": "book01",
  "intro": "Wonder Together",
  "questions": [
    {
      "id": "q1",
      "text": "Have you ever tried to build something that didn't stay together?",
      "hint": "Optional coach note — not shown to child"
    },
    {
      "id": "q2",
      "text": "What did Leo do when the tower wobbled?"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `intro` | string | no | Screen heading (default: "Wonder Together") |
| `questions[].id` | string | yes | Stable ID |
| `questions[].text` | string | yes | Large-type question shown to child + adult |
| `questions[].hint` | string | no | Coach-only facilitation note |

---

### 8.5 `stories/bookXX/activity.json`

Play Together activity definition.

```json
{
  "version": 1,
  "bookId": "book01",
  "type": "tap-explore",
  "title": "Play Together",
  "instructions": "Tap the things Leo might use to build.",
  "config": {
    "illustration": "illustrations/activity-scene.webp",
    "hotspots": [
      {
        "id": "brick",
        "x": 0.35,
        "y": 0.62,
        "radius": 0.08,
        "response": "A green brick!"
      },
      {
        "id": "cup",
        "x": 0.71,
        "y": 0.45,
        "radius": 0.06,
        "response": "A cup — maybe not for building."
      }
    ]
  }
}
```

**Supported activity types (v1):**

| Type | Description | Fail state |
|------|-------------|------------|
| `tap-explore` | Tap hotspots on illustration | None |
| `sort-items` | Drag items into groups | None — all placements accepted |
| `colour-picker` | Choose colours on a scene | None |
| `draw-canvas` | Free drawing | None |
| `custom` | Coach-defined JSON | Fallback renderer |

Each type has a dedicated `config` shape validated by a Zod discriminated union.

---

### 8.6 `stories/bookXX/pocket.json`

Pip's Pocket — one reflection, one takeaway.

```json
{
  "version": 1,
  "bookId": "book01",
  "reflection": "Leo kept trying, even when things wobbled.",
  "takeaway": "Sometimes things take more than one try.",
  "pipLine": "Pip put the green brick carefully in the backpack."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reflection` | string | yes | Gentle mirror of story (not a lesson) |
| `takeaway` | string | yes | One soft sentence for conversation after |
| `pipLine` | string | no | Pip's closing observation |

**Copy rules:** No "you should", no "this means you have ADHD", no diagnostic language.

---

### 8.7 Home object registry

Nine canonical objects (defined in `lib/constants/home-objects.ts`):

| ID | Label | Story theme (example) |
|----|-------|----------------------|
| `green-brick` | Green Brick | Trying, persistence |
| `radio` | Radio | Noise, sensitivity |
| `wall` | Wall | Boundaries, overwhelm |
| `volcano` | Volcano | Big feelings |
| `backpack` | Backpack | Carrying worries |
| `treasure-map` | Treasure Map | Uncertainty, exploration |
| `battery` | Battery | Energy, rest |
| `puzzle-piece` | Puzzle Piece | Difference, fitting in |
| `compass` | Compass | Choices, direction |

Each book maps to exactly one object via `homeObjectId`. Multiple books can share an object (different stories, same metaphor).

---

### 8.8 Future i18n schema extension

When localisation is added, text fields become:

```json
{
  "text": {
    "en": "Leo sat on the carpet...",
    "cy": "Eisteddai Leo ar y carped..."
  }
}
```

The `ContentProvider` resolves by active locale with English fallback. Schema version bumps to `2`.

---

## 9. State & Storage

### IndexedDB schema

Database name: `pips-backpack`

| Store | Key | Value | Purpose |
|-------|-----|-------|---------|
| `progress` | `bookId` | `{ lastPageId, lastPageIndex, updatedAt }` | Resume story |
| `journey` | `bookId` | `{ phase, wonderIndex, completedAt? }` | Post-story flow |
| `coach` | `settings` | `{ pinHash, showProgressBar }` | Coach preferences |
| `drafts` | `bookId` | `BookBundle` | Unsaved coach edits |

### Progress behaviour

- Save progress on every page turn (debounced 300ms)
- On re-open: "Continue where you left off?" — gentle prompt, not forced
- Coach can reset progress per book

### Why IndexedDB over localStorage?

- Structured data for 100+ books
- Larger quota for coach drafts and offline cache metadata
- Async API won't block UI thread

---

## 10. Story Engine

`StoryEngine` is the most critical component. It must work for any book without modification.

### Props

```typescript
interface StoryEngineProps {
  bookId: string;
  onComplete?: () => void;
  initialPageIndex?: number;
}
```

### Internal behaviour

1. Load `story.json` via `useBook(bookId)`
2. Read saved progress from IndexedDB (if no `initialPageIndex`)
3. Render current page via `StoryPage`
4. Handle navigation (tap zones, swipe, keyboard for accessibility)
5. Animate transitions via Framer Motion (`pages[].transition`)
6. On last page → call `onComplete` → navigate to `/wonder/[bookId]`
7. Optionally play narration (future)

### Accessibility

- Illustration `alt` text from `pages[].text` (first sentence) or dedicated `alt` field (v1.1)
- Keyboard: arrow keys for prev/next
- `prefers-reduced-motion`: disable slide transitions, keep fade instant
- Focus management on page change for screen readers

---

## 11. Wonder Together, Play Together, Pip's Pocket

### Wonder Together

- One question fills the screen
- Large typography (`Typography.Heading` scale)
- Swipe or tap to advance
- No input fields, no selections — purely conversational
- Coach hints visible only in coach preview mode

### Play Together

- Activity type resolved from `activity.json`
- Component registry pattern:

```typescript
const ACTIVITY_COMPONENTS: Record<ActivityType, React.ComponentType<ActivityProps>> = {
  'tap-explore': TapExplore,
  'sort-items': SortItems,
  'colour-picker': ColourPicker,
  'draw-canvas': DrawCanvas,
  'custom': CustomActivity,
};
```

- Completing activity = any interaction (tap "Done" button appears after first interaction)
- No timer, no score, no "wrong" feedback

### Pip's Pocket

- Pip character animation (gentle bounce)
- Reflection text fades in
- Takeaway in slightly different typographic treatment (whisper, not headline)
- Single "Back to backpack" button
- Marks journey `complete` in IndexedDB

---

## 12. Coach Mode

### Access

- Hidden gesture: **long-press (2s) on Pip's backpack logo** on home screen
- Opens `PinGate` modal
- Default PIN: `1234` (must change on first use — coach settings)

### Capabilities

| Feature | Implementation |
|---------|----------------|
| Edit books | `BookEditor` — tabbed UI writing to JSON files via coach API route |
| Add books | Copy `_template/`, scaffold via `scripts/scaffold-book.ts` |
| Upload artwork | `IllustrationUploader` → saves to `stories/bookXX/illustrations/` |
| Edit questions | `QuestionEditor` → `coach.json` |
| Edit activities | `ActivityEditor` → `activity.json` |
| Export PDF | `generateBookPdf.ts` — story + questions printable |
| Backup library | `exportLibrary.ts` — zip entire `/stories` folder |

### Coach write path (v1)

Coach edits save to IndexedDB drafts first, then export as downloadable JSON zip (static hosting cannot write to filesystem). For local dev, a Next.js API route `/api/coach/save` writes to disk.

**Production note:** Without a backend, coach edits persist in IndexedDB and export/import via backup zip. Full CMS (future) replaces this.

### Security model (v1)

- PIN stored as SHA-256 hash in IndexedDB
- No network auth
- Coach routes check `useCoachMode()` — client-side gate (sufficient for child safety, not enterprise security)

---

## 13. PWA & Offline Strategy

### Manifest (`app/manifest.ts`)

```typescript
{
  name: "Pip's Backpack",
  short_name: "Pip's Backpack",
  theme_color: "#F5E6D3",      // warm cream
  background_color: "#F5E6D3",
  display: "standalone",
  orientation: "any",
  start_url: "/",
}
```

### Service worker caching

| Resource | Strategy |
|----------|----------|
| App shell (JS, CSS) | CacheFirst |
| `/stories/**/*.json` | StaleWhileRevalidate |
| Illustrations (WebP) | CacheFirst with cache bust via filename |
| Fonts | CacheFirst |

### Offline behaviour

- Previously visited books fully readable offline
- Unvisited books show gentle "This story is waiting to be downloaded" with retry
- Coach export works offline (reads IndexedDB drafts)

---

## 14. Styling & Motion System

### Design tokens (CSS custom properties)

```css
:root {
  --color-cream: #F5E6D3;
  --color-warm-white: #FFF8F0;
  --color-soft-blue: #7EB8DA;      /* Pip's colour */
  --color-golden: #F4C542;          /* Backpack accent */
  --color-comic-outline: #2D2A26;
  --color-text-primary: #3D3832;
  --color-text-soft: #6B6560;

  --radius-soft: 1.25rem;
  --radius-round: 9999px;

  --font-display: 'Nunito', sans-serif;
  --font-body: 'Nunito', sans-serif;

  --motion-float-duration: 4s;
  --motion-page-duration: 0.5s;
  --motion-ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Tailwind extension

Tokens mapped in `tailwind.config.ts` for utility classes: `bg-cream`, `text-soft-blue`, etc.

### Motion principles

| Animation | Duration | Notes |
|-----------|----------|-------|
| Backpack float | 4s loop | Subtle Y translate ±6px |
| Page transition | 500ms | Fade default; slide optional |
| Object reveal | 600ms stagger | When backpack opens |
| Button press | 150ms | Scale 0.97, no bounce |

All motion respects `prefers-reduced-motion: reduce`.

### Art direction implementation

- Illustrations: `object-fit: contain`, min 60vh on story pages
- Comic outlines: CSS `border: 2px solid var(--color-comic-outline)` on cards
- Large faces: characters use SVG components scaled responsively

---

## 15. Future Extensibility

### Localisation

- Add `locale` field to catalog entries
- Text fields become `{ en, cy, ... }` objects (schema v2)
- `ContentProvider.getBook(id, locale)` resolves strings
- UI strings in `lib/i18n/ui.json`

### Narration

- `narration` field already in story schema
- `NarrationButton` plays audio via Web Audio API
- Preload next page audio in background
- Coach uploads MP3 to `stories/bookXX/audio/`

### CMS integration

```
LocalJsonProvider  →  CmsProvider (Contentful / Sanity / custom)
```

Components unchanged — only provider implementation swaps.

### Cloud sync

```
interface SyncAdapter {
  pushProgress(userId: string, progress: Progress[]): Promise<void>;
  pullProgress(userId: string): Promise<Progress[]>;
  pushLibrary(bundle: BookBundle): Promise<void>;
}
```

Progress sync only initially — content remains CDN/static.

---

## 16. Testing Strategy

| Layer | Tool | Focus |
|-------|------|-------|
| Schema validation | `scripts/validate-stories.ts` in CI | All JSON valid |
| Unit tests | Vitest | `lib/storage`, `lib/content`, schema parsers |
| Component tests | Testing Library | StoryEngine navigation, WonderTogether flow |
| E2E | Playwright | Full journey: home → story → pocket |
| Visual regression | Optional (Chromatic) | Illustration layout breakpoints |

No tests for copy content — that's editorial.

---

## 17. Build & Deployment

### Development

```bash
npm run dev          # Next.js dev server
npm run validate     # Validate all story JSON
npm run scaffold -- book11  # New book from template
```

### Production

- **Static export** (`output: 'export'`) for CDN hosting (Netlify, Vercel static, S3)
- Stories bundled at build time; new books require rebuild OR runtime fetch (configurable)
- For 100 books: recommend **runtime JSON fetch** from `/stories` path (no rebuild needed)

### CI pipeline

1. `npm run lint`
2. `npm run validate`
3. `npm run test`
4. `npm run build`
5. Deploy static assets + service worker

---

## 18. Open Questions for Approval

Please confirm or adjust before implementation begins:

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | **Coach save in production** — static hosting can't write files. OK to use IndexedDB + export/import zip for v1? | Yes for v1 |
| 2 | **`pocket.json` separate file** — spec listed `coach.json` + `activity.json` but pocket content needs a home. Separate `pocket.json`? | Yes — cleaner separation |
| 3 | **Home flow** — spec shows Home → Backpack as two steps. Home = animated backpack tap → opens `/backpack` object grid? | Yes |
| 4 | **Story object labels** — show object name to child (e.g. "Green Brick") or purely visual? | Visual only; label on hover/long-press for coaches |
| 5 | **Default PIN** — `1234` with forced change, or no default? | `1234` + prompt to change |
| 6 | **Font choice** — Nunito (warm, rounded, free)? | Nunito unless brand font supplied |
| 7 | **Reference artwork** — will illustration assets be supplied, or use placeholders initially? | Placeholder SVGs matching art direction |
| 8 | **Book count for v1** — scaffold `book01` fully, plus empty `book02`–`book09` for each home object? | 1 complete + 8 scaffolds |
| 9 | **Runtime vs build-time JSON** — fetch stories at runtime for easy content updates without rebuild? | Runtime fetch |
| 10 | **Child progress prompt** — "Continue where you left off?" or silently resume? | Gentle prompt |

---

## Approval

- [ ] Architecture approved — proceed to implementation
- [ ] Revisions requested (see notes below)

**Reviewer notes:**

_(Space for feedback)_

---

*End of architecture document*
