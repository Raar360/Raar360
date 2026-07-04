# Pip's Backpack — Technical Architecture

> **Status:** Draft for review  
> **Version:** 0.1.0  
> **Last updated:** 2026-07-04

This document defines the complete technical architecture for **Pip's Backpack**, a therapeutic storytelling platform for children and their coaches/parents. No implementation should begin until this document is approved.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Guiding Principles](#2-guiding-principles)
3. [Technology Stack](#3-technology-stack)
4. [High-Level System Diagram](#4-high-level-system-diagram)
5. [Application Flow & Routing](#5-application-flow--routing)
6. [Folder Structure](#6-folder-structure)
7. [Component Architecture](#7-component-architecture)
8. [Story Engine](#8-story-engine)
9. [JSON Schemas](#9-json-schemas)
10. [Storage & Offline Strategy](#10-storage--offline-strategy)
11. [Coach Mode](#11-coach-mode)
12. [Design System & Motion](#12-design-system--motion)
13. [PWA Configuration](#13-pwa-configuration)
14. [Future-Proofing](#14-future-proofing)
15. [Build & Deployment](#15-build--deployment)
16. [Testing Strategy](#16-testing-strategy)
17. [Open Questions for Approval](#17-open-questions-for-approval)

---

## 1. Executive Summary

Pip's Backpack is a **data-driven, offline-capable PWA** built with Next.js, React, TypeScript, TailwindCSS, and Framer Motion. Stories are defined entirely in JSON under a `stories/` directory, designed to scale to **100+ books** without code changes.

The application serves two personas:

| Persona | Access | Purpose |
|---------|--------|---------|
| **Child** | Default experience | Read stories, explore concepts calmly |
| **Coach / Parent** | Hidden PIN | Edit content, upload artwork, export/backup |

There is **no backend** in v1. All data lives locally (JSON files + IndexedDB). Architecture exposes clean interfaces so cloud sync, CMS, and narration can be added later without rewrites.

---

## 2. Guiding Principles

These constraints are non-negotiable and inform every architectural decision:

| Principle | Architectural implication |
|-----------|---------------------------|
| Stories never teach or diagnose | No quiz logic, no "correct" answers, no progress scoring |
| Recognition during story; understanding after | Story engine is read-only for children; Wonder/Play/Pocket are separate post-story phases |
| Calm, warm, safe UX | Minimal UI chrome, soft motion, no notifications/timers/achievements |
| Data-driven everything | Zero hardcoded story content in components |
| Editable by coaches | All content fields map 1:1 to editable JSON schemas |
| Scale to 100+ books | Catalog index, lazy loading, asset caching, modular activity types |
| Offline-first | PWA + precache + IndexedDB overrides |

---

## 3. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 15 (App Router)** | File-based routing, static export option, image optimisation, PWA-friendly |
| UI | **React 19 + TypeScript** | Type safety for JSON schemas, component reuse |
| Styling | **TailwindCSS v4** | Design tokens, responsive utilities, minimal CSS bundle |
| Motion | **Framer Motion** | Page transitions, backpack float animation, gentle interactions |
| Local persistence | **IndexedDB** (via `idb`) | Structured storage for progress, coach edits, uploaded assets |
| Static content | **JSON files** in `stories/` | Git-trackable, human-readable, CMS-exportable |
| PWA | **Serwist** (or `@ducanh2912/next-pwa`) | Service worker, offline caching, install prompt |
| PDF export | **@react-pdf/renderer** or **jsPDF** | Coach-mode export of story + discussion cards |
| Validation | **Zod** | Runtime validation of all JSON at load time |
| State | **React Context + useReducer** | Story session state; no global state library needed in v1 |
| i18n (future) | **next-intl** hooks prepared | All strings use `{ "en": "..." }` locale-keyed objects now |

**Explicitly excluded:** authentication servers, analytics SDKs, push notifications, gamification libraries, ad networks, subscription/payment SDKs.

---

## 4. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (PWA)                               │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js App Router                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   Home   │→│ Backpack │→│  Story   │→│  Wonder  │→│   Play   │→│
│  │          │ │ (choose) │ │ (engine) │ │ Together │ │ Together │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│       │                                              ┌──────────┐   │
│       │                                              │  Pip's   │   │
│       │                                              │  Pocket  │   │
│       │                                              └──────────┘   │
│       │                                                             │
│  ┌────▼─────────────────────────────────────────────────────────┐   │
│  │                    Coach Mode (PIN gate)                      │   │
│  │  Edit books · Upload art · Export PDF · Backup library      │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  Library Layer                                                      │
│  ┌─────────────────┐    merge     ┌─────────────────────────────┐ │
│  │  stories/ JSON  │ ──────────→  │   Resolved Book Library     │ │
│  │  (bundled)      │              │   (in-memory + validated)   │ │
│  └─────────────────┘              └─────────────────────────────┘ │
│  ┌─────────────────┐    overlay   ┌─────────────────────────────┐ │
│  │  IndexedDB      │ ──────────→  │   Coach overrides & uploads │ │
│  │  (edits/assets) │              │                             │ │
│  └─────────────────┘              └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  Service Worker (Serwist)                                           │
│  Precache shell · Cache story assets · Offline fallback             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Application Flow & Routing

### User journey (Child)

```
Home → Pip's Backpack → Choose Story → Story → Wonder Together → Play Together → Pip's Pocket
```

Each phase is a distinct route. The child cannot skip ahead to Wonder/Play/Pocket until the story is complete (soft gate — no punishment, just a gentle "Let's finish the story first").

### Route map

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | **Home** | Large animated backpack; tap to open |
| `/backpack` | **Pip's Backpack** | Story objects float out; each opens one book |
| `/story/[bookId]` | **Story** | JSON-driven page reader |
| `/story/[bookId]/wonder` | **Wonder Together** | One question per screen |
| `/story/[bookId]/play` | **Play Together** | Gentle interactive activity |
| `/story/[bookId]/pocket` | **Pip's Pocket** | One reflection + one takeaway |
| `/coach` | **Coach PIN gate** | Hidden entry (long-press logo or konami-style gesture + route) |
| `/coach/library` | **Coach library manager** | List/edit/add books |
| `/coach/book/[bookId]` | **Coach book editor** | Tabbed editor for all JSON fields |
| `/coach/backup` | **Backup & export** | ZIP backup, PDF export |

### Navigation rules

- **Back** always returns to the previous phase, never exits abruptly.
- **Home** accessible from a small, calm home icon (not aggressive).
- No browser-history traps; all routes are real URLs (shareable within device, bookmarkable).
- Story progress is remembered per `bookId` in IndexedDB.

---

## 6. Folder Structure

Every folder is explained below. This is the complete project tree for v1.

```
pips-backpack/
│
├── docs/
│   └── ARCHITECTURE.md              # This document
│
├── public/
│   ├── manifest.webmanifest         # PWA manifest (name, icons, theme)
│   ├── icons/                       # PWA icons (192, 512, maskable)
│   └── fonts/                       # Self-hosted readable fonts (optional)
│
├── stories/                         # ★ Source of truth for all book content
│   ├── index.json                   # Catalog: lists all books + object mappings
│   ├── _schema/                     # JSON Schema files for validation/docs
│   │   ├── index.schema.json
│   │   ├── story.schema.json
│   │   ├── coach.schema.json
│   │   └── activity.schema.json
│   └── book01/                      # One folder per book (book02, book03, …)
│       ├── meta.json                # Book metadata (title, object, availability)
│       ├── story.json               # Pages, text, illustration refs
│       ├── coach.json               # Wonder questions + Pip's Pocket content
│       ├── activity.json            # Play Together activity definition
│       └── illustrations/           # Page artwork (webp preferred)
│           ├── cover.webp
│           ├── page-01.webp
│           └── ...
│
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout: fonts, providers, calm background
│   │   ├── page.tsx                 # Home screen
│   │   ├── backpack/
│   │   │   └── page.tsx             # Choose story (objects)
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
│   │   │   ├── page.tsx             # PIN entry
│   │   │   ├── library/
│   │   │   │   └── page.tsx
│   │   │   ├── book/
│   │   │   │   └── [bookId]/
│   │   │   │       └── page.tsx
│   │   │   └── backup/
│   │   │       └── page.tsx
│   │   └── globals.css              # Tailwind imports + CSS variables
│   │
│   ├── components/
│   │   ├── layout/                  # Shell components used across routes
│   │   │   ├── AppShell.tsx         # Max-width container, safe areas
│   │   │   ├── CalmBackground.tsx   # Warm gradient / subtle texture
│   │   │   ├── BackButton.tsx       # Gentle back navigation
│   │   │   └── HomeButton.tsx       # Return to home
│   │   │
│   │   ├── home/
│   │   │   ├── AnimatedBackpack.tsx # Large backpack with float animation
│   │   │   └── OpenBackpackPrompt.tsx
│   │   │
│   │   ├── backpack/
│   │   │   ├── StoryObjectGrid.tsx  # Layout for floating objects
│   │   │   ├── StoryObject.tsx      # Single object (brick, radio, etc.)
│   │   │   └── ObjectEntrance.tsx   # Staggered reveal animation
│   │   │
│   │   ├── story/                   # ★ Reusable story engine UI
│   │   │   ├── StoryReader.tsx      # Top-level story container
│   │   │   ├── StoryPage.tsx        # Single page: illustration + text
│   │   │   ├── StoryIllustration.tsx
│   │   │   ├── StoryText.tsx        # Large, readable typography
│   │   │   ├── StoryControls.tsx    # Prev/next (no page numbers shown to child)
│   │   │   ├── StoryProgress.tsx    # Subtle dot progress (non-gamified)
│   │   │   ├── PageTransition.tsx   # Framer Motion wrapper
│   │   │   └── NarrationButton.tsx  # Future: play narration audio
│   │   │
│   │   ├── wonder/
│   │   │   ├── WonderCarousel.tsx   # One question per screen
│   │   │   ├── WonderQuestion.tsx   # Large typography card
│   │   │   └── WonderIntro.tsx      # Optional intro before questions
│   │   │
│   │   ├── play/
│   │   │   ├── PlayActivity.tsx     # Activity router (delegates by type)
│   │   │   ├── TapRevealActivity.tsx
│   │   │   ├── DragExploreActivity.tsx
│   │   │   ├── SequenceActivity.tsx
│   │   │   └── ActivityInstructions.tsx
│   │   │
│   │   ├── pocket/
│   │   │   ├── PocketReflection.tsx
│   │   │   └── PocketTakeaway.tsx
│   │   │
│   │   ├── characters/
│   │   │   ├── Leo.tsx              # Leo illustration component (when needed)
│   │   │   └── Pip.tsx              # Pip companion (appears in UI chrome)
│   │   │
│   │   ├── coach/
│   │   │   ├── PinGate.tsx          # PIN entry pad
│   │   │   ├── BookList.tsx         # All books with edit/add
│   │   │   ├── BookEditor.tsx       # Tabbed JSON field editor
│   │   │   ├── PageEditor.tsx       # Edit individual story pages
│   │   │   ├── QuestionEditor.tsx   # Edit wonder questions
│   │   │   ├── ActivityEditor.tsx   # Edit play activity config
│   │   │   ├── ArtworkUploader.tsx  # Upload/replace illustrations
│   │   │   ├── BackupExport.tsx     # ZIP download
│   │   │   └── PdfExport.tsx        # Generate PDF
│   │   │
│   │   └── ui/                      # Primitive design-system components
│   │       ├── Button.tsx           # Soft, rounded, no harsh states
│   │       ├── Card.tsx
│   │       ├── Typography.tsx       # Heading, Body, Question variants
│   │       ├── Modal.tsx            # Gentle overlay (coach only)
│   │       └── Spinner.tsx          # Calm loading indicator
│   │
│   ├── lib/
│   │   ├── story-engine/            # ★ Core story logic (framework-agnostic)
│   │   │   ├── StoryEngine.ts       # Page navigation, completion detection
│   │   │   ├── StoryContext.tsx     # React provider for active story session
│   │   │   ├── useStory.ts          # Hook: current page, goNext, goPrev
│   │   │   └── transitions.ts       # Transition type → Framer Motion variant map
│   │   │
│   │   ├── library/                 # Book loading & merging
│   │   │   ├── loadBook.ts          # Fetch + validate single book
│   │   │   ├── loadCatalog.ts       # Load stories/index.json
│   │   │   ├── resolveLibrary.ts    # Merge bundled JSON + IndexedDB overrides
│   │   │   └── validateBook.ts      # Zod validation wrapper
│   │   │
│   │   ├── storage/                 # IndexedDB abstraction
│   │   │   ├── db.ts                # IndexedDB schema & connection
│   │   │   ├── progressStore.ts     # Story progress per book
│   │   │   ├── coachStore.ts        # Coach edits & uploaded assets
│   │   │   └── types.ts             # Storage record types
│   │   │
│   │   ├── coach/
│   │   │   ├── auth.ts              # PIN hash verify (Web Crypto API)
│   │   │   ├── exportZip.ts         # Backup library as ZIP (JSZip)
│   │   │   └── exportPdf.ts         # PDF generation
│   │   │
│   │   ├── activities/              # Play Together activity registry
│   │   │   ├── registry.ts          # type → component + validator map
│   │   │   ├── tap-reveal.ts
│   │   │   ├── drag-explore.ts
│   │   │   └── sequence.ts
│   │   │
│   │   ├── i18n/                    # Future localisation
│   │   │   ├── locale.ts            # Current locale detection
│   │   │   └── resolveString.ts     # Pick string from { "en": "...", "cy": "..." }
│   │   │
│   │   └── utils/
│   │       ├── cn.ts                # clsx + tailwind-merge
│   │       └── assetUrl.ts          # Resolve illustration path for book
│   │
│   ├── hooks/
│   │   ├── useProgress.ts           # Read/write story progress
│   │   ├── useCoachSession.ts       # Coach auth session (sessionStorage)
│   │   ├── useResolvedBook.ts       # Load merged book data
│   │   └── useOfflineStatus.ts      # Online/offline indicator (coach only)
│   │
│   ├── types/                       # TypeScript types (generated from Zod)
│   │   ├── book.ts
│   │   ├── story.ts
│   │   ├── coach.ts
│   │   ├── activity.ts
│   │   └── catalog.ts
│   │
│   ├── config/
│   │   ├── storyObjects.ts          # Object key → display name, icon/illustration
│   │   ├── characters.ts            # Leo & Pip metadata
│   │   └── theme.ts                 # Colour tokens reference
│   │
│   └── styles/
│       └── tokens.css               # CSS custom properties (warm palette)
│
├── scripts/
│   ├── validate-stories.ts          # CI: validate all JSON against Zod
│   └── copy-stories-to-public.ts    # Build: symlink/copy stories → public/stories
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── serwist.config.ts                # Service worker / precache config
```

### Key folder decisions

| Decision | Choice | Why |
|----------|--------|-----|
| `stories/` at repo root | Not inside `src/` | Content is separate from code; coaches/CMS can export here; git diffs are clean |
| `meta.json` per book | Separate from `story.json` | Catalog queries don't need to load full story; object mapping lives in meta |
| `lib/story-engine/` | Framework-agnostic TS | Testable without React; portable if engine moves to native app later |
| `components/ui/` | Primitive layer | Consistent calm design; story components compose from primitives |
| `scripts/validate-stories.ts` | CI validation | Catch schema errors before deploy; critical at 100 books scale |
| `_schema/` in stories | JSON Schema docs | Machine-readable contracts for future CMS integration |

---

## 7. Component Architecture

### Layer model

```
┌─────────────────────────────────────────────┐
│  Pages (src/app/)                           │  Route entry; minimal logic
├─────────────────────────────────────────────┤
│  Feature Components (src/components/*)      │  Home, Story, Wonder, Play, Pocket, Coach
├─────────────────────────────────────────────┤
│  Story Engine (src/lib/story-engine/)       │  State machine, progress, transitions
├─────────────────────────────────────────────┤
│  Library & Storage (src/lib/library, storage)│  Load, validate, merge, persist
├─────────────────────────────────────────────┤
│  UI Primitives (src/components/ui/)         │  Button, Card, Typography
└─────────────────────────────────────────────┘
```

### Component responsibility matrix

| Component | Responsibility | Props / inputs |
|-----------|----------------|----------------|
| `AnimatedBackpack` | Hero animation on home | `onOpen: () => void` |
| `StoryObject` | Render one backpack object | `objectKey`, `bookId`, `label`, `illustration` |
| `StoryReader` | Orchestrate story session | `book: ResolvedBook` |
| `StoryPage` | Render one page | `page: StoryPage`, `locale` |
| `PageTransition` | Animate between pages | `transition: TransitionType`, `children` |
| `WonderCarousel` | Swipe/tap through questions | `questions: WonderQuestion[]` |
| `PlayActivity` | Route to activity by type | `activity: ActivityDefinition` |
| `PocketReflection` | Display reflection text | `text: LocalizedString` |
| `PinGate` | Coach authentication | `onSuccess: () => void` |
| `BookEditor` | Full book CRUD UI | `bookId`, `initialData` |

### Composition example: Story route

```tsx
// src/app/story/[bookId]/page.tsx  (pseudocode)
export default function StoryPage({ params }) {
  const book = useResolvedBook(params.bookId);
  return (
    <AppShell>
      <StoryReader book={book}>
        <StoryPageView />      {/* illustration + text */}
        <StoryControls />      {/* gentle prev/next */}
        <StoryProgress />      {/* subtle dots */}
      </StoryReader>
    </AppShell>
  );
}
```

---

## 8. Story Engine

The story engine is the reusable core. Every book uses the same engine; only JSON differs.

### State machine

```
                    ┌──────────┐
         start ────→│  IDLE    │
                    └────┬─────┘
                         │ load book
                         ▼
                    ┌──────────┐
              ┌────→│ READING  │←────┐
              │     └────┬─────┘     │
              │  prev    │ next      │ prev
              │          ▼           │
              │   (more pages?)      │
              │     │         │      │
              │    yes        no     │
              │     │         ▼      │
              │     └─────────┘  ┌───────────┐
              │                │ COMPLETE  │
              │                └─────┬─────┘
              │                      │ navigate
              │                      ▼
              │                Wonder Together
              └──────────────── (not part of engine;
                                   separate route)
```

### StoryEngine API (framework-agnostic)

```typescript
interface StoryEngine {
  bookId: string;
  totalPages: number;
  currentIndex: number;
  currentPage: StoryPage;
  isFirstPage: boolean;
  isLastPage: boolean;
  isComplete: boolean;
  goNext(): void;
  goPrev(): void;
  goTo(index: number): void;   // Coach preview only
  markComplete(): void;
}
```

### Progress memory

Stored in IndexedDB (`progressStore`):

```typescript
interface BookProgress {
  bookId: string;
  lastPageIndex: number;       // Resume reading
  storyComplete: boolean;    // Gate to Wonder/Play/Pocket
  wonderComplete: boolean;
  playComplete: boolean;
  pocketViewed: boolean;
  lastVisitedAt: string;     // ISO timestamp (for coach dashboard, not shown to child)
}
```

**No streaks. No scores. No badges.** Progress exists solely to resume gently and gate phases.

### Page transitions

Defined per page in JSON (`transition` field). Mapped in `transitions.ts`:

| Transition key | Motion behaviour |
|----------------|------------------|
| `fade` | Crossfade (default) |
| `slide-left` | Gentle horizontal slide |
| `slide-up` | Soft vertical reveal |
| `none` | Instant (accessibility preference) |

Respects `prefers-reduced-motion`: all transitions degrade to `fade` or `none`.

---

## 9. JSON Schemas

All content is validated at load time with **Zod**. JSON Schema files in `stories/_schema/` mirror these for documentation and CMS tooling.

### 9.1 Shared types

```typescript
/** Localised string — ready for future i18n */
type LocalizedString = {
  en: string;
  [locale: string]: string;
};

/** Illustration reference relative to book folder */
type IllustrationRef = string;  // e.g. "illustrations/page-01.webp"
```

---

### 9.2 `stories/index.json` — Catalog

Lists every book and maps story objects to books.

```json
{
  "version": "1.0.0",
  "updatedAt": "2026-07-04T00:00:00.000Z",
  "books": [
    {
      "id": "book01",
      "objectKey": "green-brick",
      "order": 1,
      "enabled": true
    },
    {
      "id": "book02",
      "objectKey": "radio",
      "order": 2,
      "enabled": true
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | yes | Catalog schema version |
| `updatedAt` | ISO string | yes | Last catalog update |
| `books[].id` | string | yes | Folder name under `stories/` |
| `books[].objectKey` | string | yes | Home screen object identifier |
| `books[].order` | number | yes | Display order in backpack |
| `books[].enabled` | boolean | yes | Hide unfinished books from children |

**Object keys (fixed set for home screen):**

| `objectKey` | Display name |
|-------------|--------------|
| `green-brick` | Green Brick |
| `radio` | Radio |
| `wall` | Wall |
| `volcano` | Volcano |
| `backpack` | Backpack |
| `treasure-map` | Treasure Map |
| `battery` | Battery |
| `puzzle-piece` | Puzzle Piece |
| `compass` | Compass |

Each key is used by at most one enabled book. Validation enforces uniqueness.

---

### 9.3 `stories/bookXX/meta.json` — Book metadata

```json
{
  "id": "book01",
  "version": 1,
  "objectKey": "green-brick",
  "title": {
    "en": "The Green Brick"
  },
  "subtitle": {
    "en": "A story about trying your best"
  },
  "description": {
    "en": "Leo and Pip discover something heavy and green."
  },
  "characters": ["leo", "pip"],
  "tags": ["effort", "feelings"],
  "estimatedMinutes": 8,
  "createdAt": "2026-07-04T00:00:00.000Z",
  "updatedAt": "2026-07-04T00:00:00.000Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Must match folder name |
| `version` | number | yes | Incremented on coach edits |
| `objectKey` | string | yes | Must match catalog entry |
| `title` | LocalizedString | yes | Book title |
| `subtitle` | LocalizedString | no | Shown in coach library |
| `description` | LocalizedString | no | Coach reference only |
| `characters` | string[] | yes | Character IDs appearing in story |
| `tags` | string[] | no | Coach organisation (never shown to child as labels) |
| `estimatedMinutes` | number | no | Coach planning aid |

---

### 9.4 `stories/bookXX/story.json` — Story pages

```json
{
  "id": "book01",
  "version": 1,
  "pages": [
    {
      "id": "page-01",
      "illustration": "illustrations/page-01.webp",
      "text": {
        "en": "Leo walked slowly down the path. Pip bounced beside him, eyes wide."
      },
      "narration": {
        "en": "audio/page-01.mp3"
      },
      "transition": "fade"
    },
    {
      "id": "page-02",
      "illustration": "illustrations/page-02.webp",
      "text": {
        "en": "Something green sat in the middle of the path. It looked very heavy."
      },
      "transition": "slide-left"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pages[].id` | string | yes | Unique within book |
| `pages[].illustration` | IllustrationRef | yes | Path relative to book folder |
| `pages[].text` | LocalizedString | yes | Story text (large typography on screen) |
| `pages[].narration` | LocalizedString | no | Audio path (future; button hidden if absent) |
| `pages[].transition` | enum | no | Default `fade` |

**Rules enforced by validator:**
- Minimum 1 page, no maximum (tested up to 40 pages per book).
- Page IDs must be unique.
- Illustration files must exist (build-time check).

---

### 9.5 `stories/bookXX/coach.json` — Wonder & Pocket

```json
{
  "id": "book01",
  "version": 1,
  "wonder": {
    "intro": {
      "en": "Wonder Together"
    },
    "subtitle": {
      "en": "There are no right or wrong answers. Just curious questions."
    },
    "questions": [
      {
        "id": "q1",
        "text": {
          "en": "Have you ever carried something that felt too heavy?"
        }
      },
      {
        "id": "q2",
        "text": {
          "en": "What did Leo do when things felt hard?"
        }
      },
      {
        "id": "q3",
        "text": {
          "en": "What does Pip notice that Leo might miss?"
        }
      }
    ]
  },
  "pocket": {
    "reflection": {
      "en": "Sometimes things feel heavy, even when we are trying our best."
    },
    "takeaway": {
      "en": "Leo kept going. Pip kept noticing."
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `wonder.intro` | LocalizedString | no | Screen title before questions |
| `wonder.subtitle` | LocalizedString | no | Reassurance text |
| `wonder.questions[]` | array | yes | Min 1 question |
| `wonder.questions[].text` | LocalizedString | yes | One question per screen |
| `pocket.reflection` | LocalizedString | yes | One reflection (not a lesson) |
| `pocket.takeaway` | LocalizedString | yes | One takeaway (not a moral) |

**Copy guidelines encoded in coach UI helper text:**
- Reflection = mirroring; Takeaway = gentle observation. Never imperative ("You should…").

---

### 9.6 `stories/bookXX/activity.json` — Play Together

Activity types are extensible via a registry. v1 supports three types:

#### Type: `tap-reveal`

```json
{
  "id": "book01",
  "version": 1,
  "type": "tap-reveal",
  "title": {
    "en": "Play Together"
  },
  "instructions": {
    "en": "Tap each piece to see what's underneath."
  },
  "config": {
    "items": [
      {
        "id": "item-1",
        "coverIllustration": "illustrations/play-cover-01.webp",
        "revealIllustration": "illustrations/play-reveal-01.webp",
        "label": { "en": "The green brick" }
      }
    ]
  }
}
```

#### Type: `drag-explore`

```json
{
  "type": "drag-explore",
  "config": {
    "backgroundIllustration": "illustrations/play-bg.webp",
    "draggables": [
      {
        "id": "pip",
        "illustration": "illustrations/pip-small.webp",
        "startPosition": { "x": 20, "y": 60 },
        "snapTargets": [
          { "id": "target-1", "x": 50, "y": 40, "radius": 15 }
        ]
      }
    ]
  }
}
```

#### Type: `sequence`

```json
{
  "type": "sequence",
  "config": {
    "items": [
      { "id": "step-1", "illustration": "illustrations/seq-01.webp" },
      { "id": "step-2", "illustration": "illustrations/seq-02.webp" }
    ],
    "instruction": { "en": "Put the pieces in order, just to explore." }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | yes | `tap-reveal` \| `drag-explore` \| `sequence` |
| `title` | LocalizedString | yes | Screen heading |
| `instructions` | LocalizedString | yes | Child-facing guidance |
| `config` | object | yes | Type-specific (validated by sub-schema) |

**No scoring, no failure states.** Activities complete when the child has interacted; a calm "Ready to continue?" button appears.

---

### 9.7 Resolved book type (runtime)

After loading and merging all JSON files for a book:

```typescript
interface ResolvedBook {
  meta: BookMeta;
  story: StoryDefinition;
  coach: CoachDefinition;
  activity: ActivityDefinition;
  assets: {
    illustrations: Record<string, string>;  // ref → resolved URL (bundled or blob)
  };
}
```

---

## 10. Storage & Offline Strategy

### Three storage tiers

| Tier | Technology | Contents |
|------|------------|----------|
| **Bundled** | `stories/` → `public/stories/` at build | Default JSON + illustrations |
| **IndexedDB** | `pips-backpack-db` | Progress, coach overrides, uploaded images |
| **Cache Storage** | Service Worker (Serwist) | Precached shell + visited story assets |

### IndexedDB schema

```
Database: pips-backpack-db

Store: progress
  key: bookId
  value: BookProgress

Store: coach-overrides
  key: `${bookId}/${file}`  e.g. "book01/story.json"
  value: { json: object, updatedAt: string }

Store: coach-assets
  key: `${bookId}/${path}`  e.g. "book01/illustrations/page-03.webp"
  value: { blob: Blob, mimeType: string, updatedAt: string }

Store: settings
  key: "coach-pin-hash" | "locale" | ...
  value: unknown
```

### Merge strategy

When loading a book:

1. Load bundled JSON from `/stories/bookXX/*.json`
2. Check IndexedDB for overrides with same key
3. If override exists and `version >= bundled.version`, use override
4. Resolve illustration paths: coach-uploaded blob URL > bundled public URL

### Offline behaviour

| Scenario | Behaviour |
|----------|-----------|
| First visit online | Shell + catalog cached; story assets cached on first read |
| Return visit offline | Full previously visited books work |
| Unvisited book offline | Calm message: "This story isn't packed yet. Connect to load it." |
| Coach edit offline | Saved to IndexedDB; sync/export when online |

---

## 11. Coach Mode

### Access

- Hidden route: `/coach`
- Entry gesture: long-press (800ms) on Pip icon in footer **or** direct URL
- PIN: 4–6 digits, stored as **SHA-256 hash** in IndexedDB (never plaintext)
- Session: `sessionStorage` flag, expires on tab close

### Capabilities

| Feature | Implementation |
|---------|----------------|
| Edit books | Form editors bound to JSON fields; live preview |
| Add books | Create new folder structure in IndexedDB; assign unused objectKey |
| Upload artwork | `ArtworkUploader` → blob in `coach-assets` store |
| Edit questions | `QuestionEditor` with add/remove/reorder |
| Edit activities | `ActivityEditor` with type selector + config form |
| Export PDF | Story pages + wonder questions rendered to PDF |
| Backup library | ZIP of all JSON + illustrations (bundled + overrides) |

### Coach UI principles

- Functional over beautiful (coach is utility, child experience is sacred)
- Clear labels: "Reflection (not a lesson)", "Takeaway (not a moral)"
- Preview button opens story in new tab as child would see it
- Destructive actions require confirmation

---

## 12. Design System & Motion

### Colour tokens (Tailwind / CSS variables)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-warm-cream` | `#FFF8F0` | Background |
| `--color-soft-peach` | `#FFE8D6` | Cards, panels |
| `--color-gentle-sky` | `#B8D4E8` | Pip's blue tones |
| `--color-sunny-yellow` | `#FFD166` | Pip's backpack accent |
| `--color-earth-brown` | `#8B6914` | Outlines, comic-book ink |
| `--color-story-green` | `#7CB342` | Accent (brick, nature) |
| `--color-calm-lavender` | `#D4C5E8` | Wonder Together screens |

### Typography

| Variant | Size (mobile → desktop) | Usage |
|---------|-------------------------|-------|
| `story-text` | 22px → 28px | Story page body |
| `question` | 28px → 36px | Wonder Together |
| `reflection` | 24px → 30px | Pip's Pocket |
| `ui-label` | 16px → 18px | Buttons, navigation |

Font: **Nunito** or **Quicksand** (rounded, warm, highly legible).

### Motion principles

| Animation | Duration | Easing |
|-----------|----------|--------|
| Backpack float | 3s loop | ease-in-out |
| Page transition | 400ms | `[0.4, 0, 0.2, 1]` |
| Object reveal | 500ms stagger 80ms | spring (low stiffness) |
| Button press | 150ms | scale 0.97 |

All animations respect `prefers-reduced-motion`.

### Art direction implementation

- Illustrations: `<StoryIllustration>` fills ~70% of viewport height
- Comic-book outlines: CSS `filter: drop-shadow` or SVG border overlay on UI elements (not on artwork)
- Pip companion: small persistent avatar in corner during story (optional per book)
- Leo: appears in illustrations, not as persistent UI chrome

---

## 13. PWA Configuration

### `manifest.webmanifest`

```json
{
  "name": "Pip's Backpack",
  "short_name": "Pip's Backpack",
  "description": "Therapeutic storytelling for children",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF8F0",
  "theme_color": "#B8D4E8",
  "orientation": "any"
}
```

### Service worker strategy (Serwist)

| Asset type | Strategy |
|------------|----------|
| App shell (JS/CSS) | Precache |
| `stories/index.json` | StaleWhileRevalidate |
| Story illustrations | CacheFirst (after first load) |
| Coach uploads (blob) | IndexedDB only (not SW) |

### Install prompt

- Shown once to coaches after second visit (not to children during story)
- Calm banner: "Install Pip's Backpack for offline stories"

---

## 14. Future-Proofing

Architecture hooks for planned features — **not implemented in v1**, but interfaces are designed now to avoid refactors.

| Future feature | Hook |
|----------------|------|
| **Localisation** | All strings are `LocalizedString`; `resolveString()` used everywhere |
| **Narration** | `narration` field on pages; `NarrationButton` component stubbed |
| **CMS** | JSON schemas + `validate-stories.ts`; CMS exports to `stories/` format |
| **Cloud sync** | `LibraryRepository` interface with `LocalLibraryRepository` (v1) and `CloudLibraryRepository` (future) |
| **Multi-child profiles** | `BookProgress` keyed by `profileId` (default `"default"`) |
| **Analytics for coaches** | `lastVisitedAt` in progress (local only); no child tracking |

### Library repository interface

```typescript
interface LibraryRepository {
  getCatalog(): Promise<Catalog>;
  getBook(bookId: string): Promise<ResolvedBook>;
  saveBookOverride(bookId: string, file: string, data: unknown): Promise<void>;
  saveAsset(bookId: string, path: string, blob: Blob): Promise<void>;
  exportLibrary(): Promise<Blob>;  // ZIP
}
```

---

## 15. Build & Deployment

### Build pipeline

```
1. npm run validate-stories   → Zod validate all JSON
2. npm run copy-stories       → Copy stories/ → public/stories/
3. next build                 → Static + server components
4. Serwist injects SW         → Offline support
```

### Deployment target

- **Static export** (`output: 'export'`) for maximum offline/PWA compatibility, **or**
- **Vercel/Netlify** with static assets CDN

Recommendation: **static export** to any static host (school tablets, offline kiosks).

### Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_VERSION` | Display version in coach backup |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default `en` |

No secrets in v1 (PIN is set locally by coach).

---

## 16. Testing Strategy

| Layer | Tool | Focus |
|-------|------|-------|
| JSON validation | `validate-stories.ts` in CI | Every book valid |
| Story engine | Vitest unit tests | Navigation, completion, edge cases |
| Components | React Testing Library | StoryReader renders pages; Wonder shows one question |
| E2E | Playwright (optional v1.1) | Full child journey for one book |
| Accessibility | axe-core | WCAG AA contrast, reduced motion, keyboard nav in coach |

---

## 17. Open Questions for Approval

Please confirm or adjust before implementation begins:

### A. Story object artwork
The spec lists 9 objects (Green Brick, Radio, etc.). Should each object have:
- **(Recommended)** A dedicated illustration in `public/objects/` matching the comic-book art style, **or**
- Placeholder geometric shapes until artwork is supplied?

### B. Initial book count
Should v1 ship with:
- **(Recommended)** 1 fully-authored sample book (`book01`) demonstrating all phases, **or**
- Empty scaffold with 9 object slots and no story content?

### C. Static export vs server
- **(Recommended)** Static export (`output: 'export'`) for offline/tablet deployment
- Alternative: standard Next.js server mode on Vercel

### D. Coach PIN default
- **(Recommended)** No default PIN; coach must set on first `/coach` visit
- Alternative: default PIN `1234` printed in coach documentation

### E. Reference artwork
No reference artwork was found in the repository. Please provide:
- Backpack illustration (home screen)
- Pip character asset
- At least 2 sample page illustrations for `book01`
- Or confirm placeholders are acceptable for v1 scaffold

### F. Home → Backpack interaction
- **(Recommended)** Home shows backpack → tap opens → navigate to `/backpack` with object reveal animation
- Alternative: objects animate out on home screen without route change

### G. Progress gating strictness
- **(Recommended)** Soft gate: child can access Wonder only after story complete; gentle redirect if not
- Alternative: no gating; all phases accessible from backpack

---

## Approval checklist

- [ ] Folder structure approved
- [ ] JSON schemas approved
- [ ] Component list approved
- [ ] Storage strategy approved
- [ ] Coach mode scope approved
- [ ] Open questions answered
- [ ] Ready to implement

---

*End of architecture document.*
