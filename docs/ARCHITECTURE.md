# Pip's Backpack — Technical Architecture

**Version:** 0.1 (Draft for approval)  
**Status:** Architecture only — no implementation until approved  
**Last updated:** 2026-07-04

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Principles & Constraints](#2-design-principles--constraints)
3. [Technology Decisions](#3-technology-decisions)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Routing & Navigation Flow](#6-routing--navigation-flow)
7. [Component Architecture](#7-component-architecture)
8. [Data Layer & Storage](#8-data-layer--storage)
9. [JSON Schemas](#9-json-schemas)
10. [Story Engine](#10-story-engine)
11. [Coach Mode](#11-coach-mode)
12. [PWA & Offline Strategy](#12-pwa--offline-strategy)
13. [Animation & Motion](#13-animation--motion)
14. [Accessibility & UX](#14-accessibility--ux)
15. [Future-Proofing](#15-future-proofing)
16. [Development Phases](#16-development-phases)
17. [Open Questions](#17-open-questions)

---

## 1. Executive Summary

**Pip's Backpack** is a calm, therapeutic storytelling platform for children (primary user) and coaches/parents (secondary user). Stories are data-driven JSON documents with illustrations — not hardcoded UI. The app is built as a Next.js PWA with local-first storage, designed to scale to 100+ books without architectural changes.

Two distinct experiences share one codebase:

| Mode | Access | Purpose |
|------|--------|---------|
| **Child** | Default | Read stories, wonder, play, reflect |
| **Coach** | Hidden PIN | Edit library, export, backup |

The application flow is linear per story but library-wide navigation is object-based (backpack items), not book-list based.

```
Home → Pip's Backpack → Choose Story → Story → Wonder Together → Play Together → Pip's Pocket
```

---

## 2. Design Principles & Constraints

These constraints are **architectural**, not cosmetic. They inform every technical decision.

### 2.1 What we must never build

| Forbidden | Architectural implication |
|-----------|---------------------------|
| Advertisements | No ad SDKs, no third-party trackers |
| Subscriptions | No payment flows, no paywalls |
| Scoreboards / achievements | No gamification state, no leaderboards |
| Timers | No countdown components, no time-pressure UX |
| Notifications | No push notification service (even in PWA) |
| Addictive mechanics | No streaks, no "come back" nudges, no variable rewards |

### 2.2 What stories must never do

- Never teach (no "the moral is…" UI)
- Never diagnose (no labels, no clinical language in child UI)
- Never test (Wonder Together has no correct answers; Play Together has no fail states)

### 2.3 Emotional design targets

- Calm, warm, magical, safe
- Large illustrations dominate each screen
- Soft motion (floating, gentle transitions — never frantic)
- Children leave **calmer** than when they arrived

### 2.4 Scalability target

Architecture must support **100+ books** with:

- Lazy loading of story assets
- Indexed library metadata (no loading all JSON at startup)
- Coach-editable content without code changes
- Stable component APIs regardless of book count

---

## 3. Technology Decisions

### 3.1 Core stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 15 (App Router)** | File-based routing, SSR/SSG for fast first paint, API routes for coach operations |
| UI | **React 19 + TypeScript** | Type-safe component composition at scale |
| Styling | **Tailwind CSS v4** | Utility-first, design tokens via CSS variables, responsive by default |
| Motion | **Framer Motion** | Declarative page transitions, gentle floating animations |
| Storage | **Local JSON + IndexedDB** | Human-readable source files; runtime cache for progress & coach edits |
| PWA | **next-pwa** or **Serwist** | Offline shell + cached assets |
| Validation | **Zod** | Runtime JSON schema validation for all story/coach data |
| Icons / UI primitives | **Radix UI** (minimal) | Accessible dialogs, focus traps for coach mode only |

### 3.2 Explicit non-choices

| Considered | Rejected because |
|------------|------------------|
| Redux / Zustand global store | Story progress is local and scoped; React Context + hooks suffice |
| CMS (Sanity, Contentful) now | Local JSON first; CMS is future phase with same schema |
| Database | Local-first; cloud sync is future phase |
| Authentication (OAuth) | Coach PIN is sufficient for v1; no child accounts |
| ePub / PDF reader | This is illustration + text pages, not reflowable documents |

### 3.3 Rendering strategy

| Route type | Strategy |
|------------|----------|
| Home, Backpack | SSG with client hydration for animation |
| Story pages | Dynamic `[bookId]` with ISR or client fetch from `/stories/` |
| Coach routes | Client-only, PIN-gated, no indexing (`robots: noindex`) |

Stories ship as static files under `public/stories/` (or imported at build time for bundled books). Coach-added books live in IndexedDB and merge at runtime.

---

## 4. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Shell                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │   Layout    │  │  Providers   │  │   PWA Service Worker    │ │
│  │  (fonts,    │  │  Theme,      │  │   (cache stories,       │ │
│  │   tokens)   │  │  Progress,   │  │    illustrations,       │ │
│  │             │  │  CoachAuth)  │  │    app shell)             │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Library      │   │  Story Engine   │   │  Coach Admin    │
│  Service      │   │  (read JSON,    │   │  (CRUD books,   │
│  (index,      │   │   render pages, │   │   export PDF,   │
│   merge local)│   │   track progress│   │   backup)       │
└───────────────┘   └─────────────────┘   └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  Storage Layer  │
                    │  • public/      │
                    │    stories/     │
                    │  • IndexedDB    │
                    │    (progress,   │
                    │     overrides)  │
                    └─────────────────┘
```

### 4.1 Data flow (child reads a story)

1. User opens backpack → `LibraryService.getStoryObjects()` returns manifest entries with object metadata
2. User taps "Green Brick" → navigate to `/story/[bookId]`
3. `StoryEngine` loads `story.json`, validates with Zod, hydrates `StoryReader`
4. On page turn → `ProgressService.savePage(bookId, pageIndex)` → IndexedDB
5. Story complete → navigate to `/story/[bookId]/wonder`
6. Wonder complete → `/story/[bookId]/play`
7. Play complete → `/story/[bookId]/pocket`
8. Pocket complete → return to backpack or home

---

## 5. Folder Structure

```
/workspace
├── docs/
│   └── ARCHITECTURE.md              # This document
│
├── public/
│   ├── manifest.json                # PWA manifest
│   ├── icons/                       # App icons (192, 512, maskable)
│   ├── fonts/                       # Self-hosted display + body fonts
│   └── stories/                     # Bundled story library (read-only at runtime)
│       ├── index.json               # Library manifest (all book metadata)
│       ├── book01/
│       │   ├── meta.json            # Book metadata + backpack object mapping
│       │   ├── story.json           # Pages, text, illustration refs
│       │   ├── coach.json           # Coach-only notes (hidden from child UI)
│       │   ├── wonder.json          # Discussion question cards
│       │   ├── activity.json        # Play Together interaction definition
│       │   ├── pocket.json          # Reflection + takeaway
│       │   └── illustrations/
│       │       ├── page-01.webp
│       │       └── ...
│       └── book02/
│           └── ...
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout, fonts, providers
│   │   ├── page.tsx                 # Home
│   │   ├── globals.css              # Design tokens, Tailwind imports
│   │   ├── backpack/
│   │   │   └── page.tsx             # Pip's Backpack (object selection)
│   │   ├── story/
│   │   │   └── [bookId]/
│   │   │       ├── page.tsx         # Story reader
│   │   │       ├── wonder/
│   │   │       │   └── page.tsx
│   │   │       ├── play/
│   │   │       │   └── page.tsx
│   │   │       └── pocket/
│   │   │           └── page.tsx
│   │   ├── coach/
│   │   │   ├── layout.tsx           # PIN gate wrapper
│   │   │   ├── page.tsx             # Coach dashboard
│   │   │   ├── books/
│   │   │   │   ├── page.tsx         # Book list
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [bookId]/
│   │   │   │       ├── page.tsx     # Edit book metadata
│   │   │   │       ├── story/page.tsx
│   │   │   │       ├── wonder/page.tsx
│   │   │   │       ├── activity/page.tsx
│   │   │   │       └── pocket/page.tsx
│   │   │   ├── export/page.tsx
│   │   │   └── backup/page.tsx
│   │   └── api/
│   │       ├── library/route.ts     # Merge bundled + local books
│   │       └── coach/
│   │           ├── backup/route.ts
│   │           └── export-pdf/route.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # Safe-area, max-width container
│   │   │   ├── PageTransition.tsx   # Framer Motion route wrapper
│   │   │   └── CalmBackground.tsx   # Soft gradient / texture
│   │   │
│   │   ├── home/
│   │   │   ├── AnimatedBackpack.tsx # Hero backpack with float animation
│   │   │   └── HomeIntro.tsx        # Optional welcome copy
│   │   │
│   │   ├── backpack/
│   │   │   ├── BackpackOpen.tsx     # Open state reveal
│   │   │   ├── StoryObject.tsx      # Single tappable object (Green Brick, etc.)
│   │   │   └── StoryObjectGrid.tsx  # Layout for objects inside backpack
│   │   │
│   │   ├── story/
│   │   │   ├── StoryReader.tsx      # Orchestrator: loads JSON, manages page state
│   │   │   ├── StoryPage.tsx        # Single page: illustration + text
│   │   │   ├── StoryIllustration.tsx# Optimized image with comic outline frame
│   │   │   ├── StoryText.tsx        # Large readable typography
│   │   │   ├── StoryProgress.tsx    # Dot/bar progress (non-timer, non-scoring)
│   │   │   ├── StoryNav.tsx         # Prev/next, gentle affordances
│   │   │   └── NarrationButton.tsx  # Future: play/pause narration (stub v1)
│   │   │
│   │   ├── wonder/
│   │   │   ├── WonderTogether.tsx   # Question card flow
│   │   │   ├── QuestionCard.tsx     # One question per screen
│   │   │   └── WonderNav.tsx
│   │   │
│   │   ├── play/
│   │   │   ├── PlayTogether.tsx     # Activity orchestrator
│   │   │   ├── activities/          # Pluggable activity renderers
│   │   │   │   ├── TapExplore.tsx   # Tap hotspots on illustration
│   │   │   │   ├── DragGentle.tsx   # Drag without snap-fail
│   │   │   │   ├── DrawSpace.tsx    # Free draw canvas
│   │   │   │   └── ChoiceExplore.tsx# Pick options, all valid
│   │   │   └── ActivityRenderer.tsx # Maps activity.type → component
│   │   │
│   │   ├── pocket/
│   │   │   ├── PipsPocket.tsx         # Reflection screen
│   │   │   ├── ReflectionCard.tsx
│   │   │   └── TakeawayCard.tsx
│   │   │
│   │   ├── coach/
│   │   │   ├── PinGate.tsx          # Hidden PIN entry
│   │   │   ├── CoachDashboard.tsx
│   │   │   ├── BookEditor.tsx
│   │   │   ├── PageEditor.tsx       # Edit story pages
│   │   │   ├── IllustrationUpload.tsx
│   │   │   ├── QuestionEditor.tsx
│   │   │   ├── ActivityEditor.tsx
│   │   │   ├── ExportPanel.tsx
│   │   │   └── BackupPanel.tsx
│   │   │
│   │   └── ui/                      # Shared primitives
│   │       ├── Button.tsx           # Soft, rounded, no aggressive CTAs
│   │       ├── Card.tsx
│   │       ├── Dialog.tsx
│   │       ├── Typography.tsx       # Display + body scale
│   │       └── SafeImage.tsx        # next/image wrapper with fallbacks
│   │
│   ├── lib/
│   │   ├── schemas/                 # Zod schemas (source of truth for types)
│   │   │   ├── book.ts
│   │   │   ├── story.ts
│   │   │   ├── wonder.ts
│   │   │   ├── activity.ts
│   │   │   ├── pocket.ts
│   │   │   ├── library.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── services/
│   │   │   ├── library.service.ts   # Load, merge, index books
│   │   │   ├── story.service.ts     # Fetch & validate story JSON
│   │   │   ├── progress.service.ts  # Page memory per book
│   │   │   ├── coach.service.ts     # CRUD for coach edits
│   │   │   ├── storage.service.ts   # IndexedDB abstraction
│   │   │   ├── export.service.ts    # PDF generation
│   │   │   └── backup.service.ts    # Export/import library ZIP
│   │   │
│   │   ├── hooks/
│   │   │   ├── useBook.ts
│   │   │   ├── useStoryProgress.ts
│   │   │   ├── useCoachAuth.ts
│   │   │   └── useOfflineStatus.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── story-objects.ts     # Object type enum + default icons
│   │   │   ├── motion.ts            # Shared Framer Motion variants
│   │   │   └── design-tokens.ts
│   │   │
│   │   └── utils/
│   │       ├── id.ts                # bookId generation
│   │       ├── paths.ts             # Asset path helpers
│   │       └── locale.ts            # Future i18n helpers (stub)
│   │
│   ├── providers/
│   │   ├── ThemeProvider.tsx
│   │   ├── ProgressProvider.tsx
│   │   └── CoachAuthProvider.tsx
│   │
│   └── types/
│       └── index.ts                 # Re-exports from Zod inferred types
│
├── stories/                         # Source-of-truth for development (optional mirror)
│   └── ...                          # Same structure as public/stories; build copies to public
│
├── scripts/
│   ├── validate-stories.ts          # CI: validate all JSON against Zod
│   ├── build-library-index.ts       # Generate public/stories/index.json
│   └── sync-stories-to-public.ts    # Dev convenience copy
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md                          # Project overview (replace profile README)
```

### 5.1 Folder rationale

| Folder | Why it exists |
|--------|---------------|
| `public/stories/` | Static assets served directly; cacheable by service worker; no server needed offline |
| `src/lib/schemas/` | Single source of truth — TypeScript types are `z.infer<>` from Zod, never duplicated |
| `src/lib/services/` | All I/O and business logic lives here; components stay presentational |
| `src/components/play/activities/` | Activity types are plugins — new interaction = new file + registry entry, no StoryReader changes |
| `stories/` (root) | Authoring workspace; coaches and devs edit here; build script validates and copies |
| `scripts/` | Keeps JSON integrity as library grows to 100+ books |

---

## 6. Routing & Navigation Flow

### 6.1 Route map

| Path | Screen | User |
|------|--------|------|
| `/` | Home — animated backpack | Child |
| `/backpack` | Open backpack, choose story object | Child |
| `/story/[bookId]` | Story reader | Child |
| `/story/[bookId]/wonder` | Wonder Together | Child |
| `/story/[bookId]/play` | Play Together | Child |
| `/story/[bookId]/pocket` | Pip's Pocket | Child |
| `/coach` | PIN gate → dashboard | Coach |
| `/coach/books` | Manage library | Coach |
| `/coach/books/[bookId]/...` | Edit book sections | Coach |
| `/coach/export` | PDF export | Coach |
| `/coach/backup` | Backup / restore | Coach |

### 6.2 Navigation rules

- **No back-button traps** — always a calm way to return home
- **Progress is remembered** — reopening a story offers "Continue" or "Start again" (no guilt copy)
- **Linear post-story flow** — Wonder → Play → Pocket is sequential but skippable by coach setting only (default: encouraged, not forced)
- **Coach entry** — long-press on Pip logo or triple-tap corner (hidden, documented for coaches only)

### 6.3 Story object → book mapping

Each book declares its backpack object in `meta.json`:

```json
{
  "backpackObject": "green-brick"
}
```

The library index groups books by object type. Multiple books per object are supported (future); v1 assumes one book per object.

**Standard object IDs:**

| ID | Display name |
|----|--------------|
| `green-brick` | Green Brick |
| `radio` | Radio |
| `wall` | Wall |
| `volcano` | Volcano |
| `backpack` | Backpack |
| `treasure-map` | Treasure Map |
| `battery` | Battery |
| `puzzle-piece` | Puzzle Piece |
| `compass` | Compass |

---

## 7. Component Architecture

### 7.1 Layer model

```
Pages (app/)           → route entry, data fetching, metadata
    ↓
Feature components     → StoryReader, WonderTogether, PlayTogether, PipsPocket
    ↓
Domain components      → StoryPage, QuestionCard, ActivityRenderer
    ↓
UI primitives          → Button, Card, Typography, SafeImage
```

**Rule:** Pages fetch; feature components orchestrate; domain components render data; UI primitives know nothing about stories.

### 7.2 Core component specifications

#### `StoryReader`

- **Props:** `bookId: string`
- **Responsibilities:** Load `story.json`, manage current page index, persist progress, emit completion event
- **Does not:** Know about Wonder/Play/Pocket (router handles handoff)

#### `StoryPage`

- **Props:** `page: StoryPageData`, `bookId: string`
- **Layout:** Illustration ~70% viewport height, text below, generous padding
- **Motion:** Crossfade between pages (400ms, ease-in-out)

#### `WonderTogether`

- **Props:** `bookId: string`
- **Behavior:** One question per route state or full-screen swipe; large typography (min 24px body, 32px+ questions)

#### `PlayTogether` + `ActivityRenderer`

- **Props:** `bookId: string`
- **Pattern:** Registry map `{ [ActivityType]: Component }`
- **Contract:** Activities receive `activity: ActivityData` and `onComplete: () => void` — no score callback

#### `PipsPocket`

- **Props:** `bookId: string`
- **Content:** Exactly one reflection prompt + one takeaway line from `pocket.json`
- **Tone:** Observational, never prescriptive ("Some children notice…" not "You should…")

#### `AnimatedBackpack`

- Idle float animation (translateY ±8px, 4s loop)
- On tap: scale + open lid reveal → navigate to `/backpack`
- Uses CSS + Framer Motion (no Lottie dependency in v1)

### 7.3 Shared providers

| Provider | State | Persistence |
|----------|-------|-------------|
| `ThemeProvider` | Color mode (light only v1; dark reserved) | None |
| `ProgressProvider` | In-memory cache of all book progress | IndexedDB via `ProgressService` |
| `CoachAuthProvider` | PIN verified session | sessionStorage (expires on tab close) |

---

## 8. Data Layer & Storage

### 8.1 Storage tiers

| Tier | Location | Contents | Mutability |
|------|----------|----------|------------|
| **Bundled** | `public/stories/` | Ship-with-app books | Read-only at runtime |
| **Coach overrides** | IndexedDB `coach-books` | New/edited books | Coach writable |
| **Progress** | IndexedDB `progress` | `{ bookId, pageIndex, completedSections[] }` | Auto-written |
| **Preferences** | IndexedDB `prefs` | Last book, reduce motion | User/coach |

### 8.2 Library merge algorithm

```
bundledIndex = fetch('/stories/index.json')
localBooks   = indexedDB.getAll('coach-books')
merged       = { ...bundledIndex, books: mergeById(bundled, local) }
// Local books with same ID override bundled (coach edits)
// Local-only IDs append to index
```

### 8.3 IndexedDB schema

```typescript
// Database: pips-backpack v1

store: progress
  key: bookId (string)
  value: {
    bookId: string
    currentPage: number
    lastVisited: ISO8601
    completed: {
      story: boolean
      wonder: boolean
      play: boolean
      pocket: boolean
    }
  }

store: coach-books
  key: bookId (string)
  value: BookBundle  // full book folder as JSON blob + base64 illustrations

store: prefs
  key: 'global'
  value: {
    reduceMotion: boolean
    coachPinHash: string  // bcrypt hash, set on first coach login
  }
```

### 8.4 Asset handling

- Illustrations: **WebP** primary, PNG fallback for older browsers
- Max dimension: 1920px wide (responsive srcset via `next/image`)
- Narration (future): `page.narrationSrc` → MP3 in `illustrations/audio/`

---

## 9. JSON Schemas

All schemas validated by Zod at load time. Invalid books fail gracefully with coach-visible error, hidden from child library.

### 9.1 `index.json` (library root)

```json
{
  "version": "1.0.0",
  "books": [
    {
      "id": "book01",
      "title": "The Green Brick",
      "backpackObject": "green-brick",
      "coverIllustration": "/stories/book01/illustrations/cover.webp",
      "sortOrder": 1,
      "enabled": true
    }
  ]
}
```

### 9.2 `meta.json`

```json
{
  "id": "book01",
  "version": "1.0.0",
  "title": "The Green Brick",
  "subtitle": "A story about noticing big feelings",
  "backpackObject": "green-brick",
  "characters": ["leo", "pip"],
  "estimatedMinutes": null,
  "locale": "en-GB",
  "enabled": true,
  "sortOrder": 1,
  "tags": ["feelings", "school"],
  "coachOnly": {
    "themes": ["recognition of frustration"],
    "notes": "Let the child lead discussion. Do not define the brick as anger."
  }
}
```

**Note:** `estimatedMinutes` is coach reference only — **never shown to children** (timer-adjacent).

### 9.3 `story.json`

```json
{
  "id": "book01",
  "version": "1.0.0",
  "pages": [
    {
      "id": "page-01",
      "illustration": "illustrations/page-01.webp",
      "text": "Leo was building something wonderful.",
      "narration": null,
      "layout": "illustration-dominant",
      "transition": "fade"
    },
    {
      "id": "page-02",
      "illustration": "illustrations/page-02.webp",
      "text": "Pip noticed a green brick beside the tower.\n\n\"That's interesting,\" whispered Pip.",
      "narration": null,
      "layout": "illustration-dominant",
      "transition": "fade"
    }
  ],
  "settings": {
    "allowSkipPages": false,
    "showProgress": true,
    "autoAdvance": false
  }
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `pages[].id` | string | yes | Stable ID for progress |
| `pages[].illustration` | string | yes | Relative to book folder |
| `pages[].text` | string | yes | Supports `\n\n` paragraph breaks |
| `pages[].narration` | string \| null | no | Future: path to audio file |
| `pages[].layout` | enum | no | `illustration-dominant` (default), `text-overlay` |
| `pages[].transition` | enum | no | `fade`, `slide`, `none` |

### 9.4 `wonder.json`

```json
{
  "id": "book01-wonder",
  "version": "1.0.0",
  "intro": "Wonder together. There are no wrong answers.",
  "questions": [
    {
      "id": "q1",
      "text": "Has there ever been a time when something small felt really big?",
      "subtext": null,
      "pauseSeconds": null
    },
    {
      "id": "q2",
      "text": "What do you think Pip was curious about?",
      "subtext": "Take your time.",
      "pauseSeconds": null
    }
  ],
  "settings": {
    "onePerScreen": true,
    "showIntro": true
  }
}
```

**Note:** `pauseSeconds` exists for future coach tooling — **never auto-advances** in child UI.

### 9.5 `activity.json`

```json
{
  "id": "book01-activity",
  "version": "1.0.0",
  "title": "Play Together",
  "intro": "Let's explore together.",
  "type": "tap-explore",
  "config": {
    "illustration": "illustrations/activity-scene.webp",
    "hotspots": [
      {
        "id": "hotspot-1",
        "x": 0.35,
        "y": 0.62,
        "radius": 0.08,
        "label": "The green brick",
        "response": "It feels heavy in Leo's hands."
      }
    ],
    "completionHint": "Tap anywhere you feel curious."
  },
  "settings": {
    "requireAllHotspots": false
  }
}
```

#### Activity types (extensible enum)

| Type | Description | Fail state |
|------|-------------|------------|
| `tap-explore` | Tap hotspots on illustration | None |
| `drag-gentle` | Drag objects; all drop zones accept | None |
| `draw-space` | Free drawing canvas | None |
| `choice-explore` | Multiple choices; all reveal content | None |

Each type has a discriminated `config` shape validated by Zod union.

### 9.6 `pocket.json`

```json
{
  "id": "book01-pocket",
  "version": "1.0.0",
  "reflection": {
    "prompt": "I wonder what felt big for Leo today.",
    "pipNote": "Pip keeps interesting things in the pocket — just for noticing."
  },
  "takeaway": {
    "text": "Sometimes a small thing can feel very big. That's okay.",
    "attribution": null
  },
  "closing": {
    "text": "See you next time.",
    "action": "return-to-backpack"
  }
}
```

**Language rules enforced in coach editor lint:**

- No imperatives directed at child ("You must…", "Always remember to…")
- No diagnostic terms
- Takeaways are observational

### 9.7 `coach.json` (coach eyes only)

```json
{
  "id": "book01-coach",
  "discussionGuide": [
    "If the child mentions anger, reflect without relabelling.",
    "Connect to recognition, not behaviour correction."
  ],
  "suggestedPrompts": [
    "What did Leo do when the tower wobbled?"
  ],
  "contentWarnings": [],
  "authoring": {
    "createdBy": "",
    "lastEdited": "2026-07-04T00:00:00Z"
  }
}
```

Never fetched in child routes (stripped at service layer).

---

## 10. Story Engine

### 10.1 Responsibilities

The Story Engine is not a single file — it is the coordinated behavior of:

1. **Loader** — fetch JSON, validate, resolve asset paths
2. **Renderer** — `StoryReader` + `StoryPage`
3. **Navigator** — page index, prev/next, completion detection
4. **Memory** — read/write progress

### 10.2 State machine (per book)

```
                    ┌──────────┐
                    │  LOADING │
                    └────┬─────┘
                         │ success
                         ▼
              ┌──────────────────────┐
         ┌───►│   READING (page N)   │◄───┐
         │    └──────────┬───────────┘    │
         │               │ next           │ prev
         │               ▼                │
         │    (last page) COMPLETE ────────┘
         │               │
         │               ▼
         │         navigate to /wonder
         └─ (resume) from saved page
```

### 10.3 API surface (internal)

```typescript
interface StoryEngine {
  load(bookId: string): Promise<StoryDocument>
  getProgress(bookId: string): Promise<ProgressRecord | null>
  savePage(bookId: string, pageIndex: number): Promise<void>
  markSectionComplete(bookId: string, section: Section): Promise<void>
  resolveAssetPath(bookId: string, relativePath: string): string
}
```

### 10.4 Error handling

| Error | Child experience | Coach experience |
|-------|------------------|------------------|
| Missing book | "This story is resting" + return home | Dashboard error with book ID |
| Invalid JSON | Same calm fallback | Validation detail in editor |
| Missing illustration | Placeholder with soft color | Upload prompt in editor |

---

## 11. Coach Mode

### 11.1 Access model

- **PIN:** 4–6 digits, stored as bcrypt hash in IndexedDB
- **Entry:** Hidden gesture on home (long-press Pip, 3s)
- **Session:** `sessionStorage` flag, cleared on tab close
- **No child exposure:** Coach routes excluded from sitemap, `noindex` meta

### 11.2 Coach capabilities

| Feature | Implementation |
|---------|----------------|
| Edit books | Form editors bound to Zod-validated JSON; live preview |
| Add books | Generate `bookId`, scaffold folder structure in IndexedDB |
| Upload artwork | File → WebP compression client-side → base64/blob in IndexedDB |
| Edit questions | CRUD on `wonder.json` |
| Edit activities | Type picker + config form per activity type |
| Export PDF | Server route: story pages + illustrations → PDF (playwright or pdf-lib) |
| Backup library | ZIP of all JSON + illustrations; import restores to IndexedDB |

### 11.3 Coach vs child content boundary

```typescript
function stripCoachFields(book: BookBundle): ChildBookBundle {
  const { coach, ...childSafe } = book
  return childSafe
}
```

Child-facing services **never** import `coach.json`.

---

## 12. PWA & Offline Strategy

### 12.1 Manifest

```json
{
  "name": "Pip's Backpack",
  "short_name": "Pip's Backpack",
  "description": "Calm stories for understanding yourself",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF8F0",
  "theme_color": "#7EB6D4",
  "orientation": "any"
}
```

### 12.2 Caching strategy

| Resource | Strategy |
|----------|----------|
| App shell (JS/CSS) | Precache on install |
| `index.json` + book JSON | Cache-first, network update in background |
| Illustrations | Cache-first (large, immutable filenames) |
| Coach API routes | Network only |

### 12.3 Offline UX

- Offline banner: soft, non-alarming ("You're somewhere quiet — stories still work")
- No offline queue notifications
- Coach edit offline: queued to IndexedDB, syncs when online (future cloud phase)

---

## 13. Animation & Motion

### 13.1 Motion tokens (`lib/constants/motion.ts`)

```typescript
export const motion = {
  float: { duration: 4, ease: 'easeInOut', y: [-8, 8] },
  pageTransition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  tapFeedback: { scale: 0.97, duration: 0.15 },
} as const
```

### 13.2 Reduce motion

Respect `prefers-reduced-motion` and in-app `reduceMotion` pref:

- Disable float loops
- Replace crossfade with instant cut
- No parallax

---

## 14. Accessibility & UX

| Requirement | Approach |
|-------------|----------|
| Touch targets | Min 48×48px |
| Text size | Child story text ≥ 20px; questions ≥ 28px |
| Contrast | WCAG AA minimum on all text |
| Focus | Visible focus rings in coach mode; minimal in child mode |
| Screen readers | Story text in semantic `<article>`; illustrations have `alt` from page metadata |
| Language | Plain, short sentences; future `locale` field per book |

### 14.1 Design tokens (initial)

```css
:root {
  --color-warm-cream: #FFF8F0;
  --color-pip-blue: #7EB6D4;
  --color-pip-yellow: #F5D76E;
  --color-leo-orange: #E8A87C;
  --color-outline: #2D3436;
  --color-text-primary: #2D3436;
  --color-text-soft: #636E72;
  --font-display: 'Baloo 2', rounded sans;
  --font-body: 'Nunito', sans-serif;
  --radius-soft: 1.25rem;
  --shadow-gentle: 0 4px 20px rgba(45, 52, 54, 0.08);
}
```

Art style (warm colours, comic outlines) implemented via:

- SVG/CSS outline filter on illustration frames
- Consistent border-radius and soft shadows
- Reference artwork imported as CSS background samples for coach preview

---

## 15. Future-Proofing

### 15.1 Localisation

- All user-facing strings live in JSON (`text` fields)
- `meta.locale` per book
- `lib/utils/locale.ts` stub for date/format helpers
- UI chrome strings in `public/locales/en/common.json` (future)

### 15.2 Narration

- `story.json` pages already include `narration` field
- `NarrationButton` stub in v1
- Audio files colocated: `illustrations/audio/page-01.mp3`
- Playback: HTML5 Audio API, no autoplay

### 15.3 CMS

- Zod schemas map 1:1 to future CMS collections
- `LibraryService` abstracted behind interface — swap filesystem for API fetch

### 15.4 Cloud sync

- `BackupService` export format = sync unit (ZIP/JSON bundle)
- Progress store keyed by `bookId` — merge strategy documented for future multi-device
- No accounts in v1

---

## 16. Development Phases

### Phase 0 — Foundation (this approval gate)

- [ ] Approve architecture
- [ ] Initialize Next.js project with stack
- [ ] Implement Zod schemas + validation script
- [ ] Design tokens + UI primitives

### Phase 1 — Core child journey

- [ ] Home + AnimatedBackpack
- [ ] Backpack object selection
- [ ] StoryReader + one sample book (`book01`)
- [ ] Progress memory
- [ ] Wonder / Play / Pocket screens

### Phase 2 — Coach mode

- [ ] PIN gate
- [ ] Book editors
- [ ] Illustration upload
- [ ] Backup / restore

### Phase 3 — Polish & PWA

- [ ] Service worker + offline
- [ ] Export PDF
- [ ] Accessibility audit
- [ ] Sample books 02–03

### Phase 4 — Scale prep

- [ ] Performance test with 100 mock books
- [ ] CI validation pipeline
- [ ] Documentation for content authors

---

## 17. Open Questions

Please confirm or adjust before implementation:

1. **Next.js version:** Proceed with Next.js 15 App Router?
2. **Story source location:** Author in root `stories/` and copy to `public/stories/` at build, or edit directly in `public/stories/`?
3. **Sample content:** Should Phase 1 include one fully written sample book (Green Brick), or placeholder lorem ipsum with structure only?
4. **Reference artwork:** Will reference illustrations be supplied separately, or should we use placeholder SVGs matching the art direction until assets arrive?
5. **Coach PIN default:** Generate random on first install, or ship with a documented default PIN for demo?
6. **Post-story flow:** Can children skip Wonder/Play/Pocket, or always linear?
7. **Multiple books per object:** Support now (picker modal) or defer to Phase 4?
8. **PDF export scope:** Story pages only, or include Wonder questions + Pocket takeaway?
9. **Target devices:** Tablet-first (iPad) or equal phone/tablet/desktop?
10. **Domain/hosting:** Static export (fully offline) vs Node server (for PDF API)?

---

## Approval

Once this document is approved, implementation will begin with **Phase 0 + Phase 1** as scoped above.

**Please reply with approval, amendments, or answers to the open questions.**
