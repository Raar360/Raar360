# Pip's Backpack — Technical Architecture

> **Status:** Proposal — awaiting approval before implementation  
> **Version:** 1.0  
> **Date:** 2026-07-04

---

## 1. Executive Summary

**Pip's Backpack** is a calm, warm, therapeutic storytelling platform for children (primary audience: ~7 years) and their coaches/parents. Stories are data-driven, illustrated, and designed for recognition—not instruction. The app is built as a **Next.js PWA** with **local JSON storage**, offline capability, and architecture that scales to **100+ books** without code changes.

### Core principles encoded in architecture

| Principle | Architectural response |
|-----------|------------------------|
| Stories never teach or diagnose | Content lives in JSON; UI never renders “lesson” or “score” patterns |
| Recognition during story; understanding after | Story → Wonder Together → Play Together → Pip's Pocket is a fixed, gentle flow |
| Two users: Child and Coach/Parent | Separate route trees + Coach Mode gated by PIN |
| No addictive mechanics | No timers, notifications, achievements, or progress gamification in child UI |
| Everything editable | Coach Mode CRUD on all content; export/backup |
| Scale to 100 books | Registry index, lazy loading, consistent schemas |

---

## 2. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 15** (App Router) | SSR/SSG for first paint; API routes for coach operations; PWA support |
| UI | **React 19** + **TypeScript** | Type-safe, componentised UI |
| Styling | **Tailwind CSS v4** | Design tokens for warm palette; responsive utilities |
| Motion | **Framer Motion** | Soft floating animations; page transitions without jarring effects |
| Content | **Local JSON** + static illustrations | No CMS dependency at launch; coach-editable; future CMS maps 1:1 to schemas |
| Persistence | **IndexedDB** (via Dexie) + **localStorage** for lightweight prefs | Offline writes in Coach Mode; child progress survives refresh |
| PWA | **next-pwa** or `@serwist/next` | Service worker caches app shell + story assets |
| i18n (future) | **next-intl** placeholder hooks | Keys in JSON; locale folders mirror `stories/` |
| PDF export (coach) | **@react-pdf/renderer** or server-side **puppeteer** | Coach-only feature |
| Testing | **Vitest** + **Playwright** | Unit tests for schemas/loaders; E2E for child flow |

### Explicit non-goals (v1)

- No user accounts / cloud sync (interfaces reserved)
- No narration playback (schema field reserved)
- No analytics or third-party trackers
- No ads, subscriptions, or social features

---

## 3. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (PWA)                            │
├─────────────────────────────────────────────────────────────────┤
│  Child Routes          │  Coach Routes (PIN-gated)               │
│  /                     │  /coach                                 │
│  /backpack             │  /coach/books                           │
│  /backpack/[objectId]  │  /coach/books/[bookId]                │
│  /story/[bookId]       │  /coach/backup                        │
│  /story/.../wonder     │  /coach/export                        │
│  /story/.../play       │                                         │
│  /story/.../pocket     │                                         │
├─────────────────────────────────────────────────────────────────┤
│  Presentation Layer    │  StoryEngine · WonderCards · Activities │
├─────────────────────────────────────────────────────────────────┤
│  Domain Layer          │  BookLoader · ProgressStore · CoachAuth │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer            │  stories/ (bundled) · IndexedDB (edits) │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Service Worker (offline cache)
```

---

## 4. Folder Structure

```
/workspace
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── icons/                        # App icons (192, 512, maskable)
│   └── fonts/                        # Optional: rounded, friendly typeface
│
├── stories/                          # Source-of-truth content (git-tracked)
│   ├── index.json                    # Book registry (metadata only)
│   ├── book01/
│   │   ├── meta.json                 # Title, object, tags, locale keys
│   │   ├── story.json                # Pages: illustration + text
│   │   ├── coach.json                # Wonder Together questions
│   │   ├── activity.json             # Play Together interaction
│   │   ├── pocket.json               # Pip's Pocket reflection
│   │   └── illustrations/
│   │       ├── page-01.webp
│   │       └── ...
│   ├── book02/
│   └── ...
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root: fonts, theme, PWA meta
│   │   ├── page.tsx                  # Home (animated backpack)
│   │   ├── backpack/
│   │   │   ├── page.tsx              # Object selection grid
│   │   │   └── [objectId]/page.tsx   # Choose story (if multiple per object)
│   │   ├── story/
│   │   │   └── [bookId]/
│   │   │       ├── page.tsx          # Story reader
│   │   │       ├── wonder/page.tsx
│   │   │       ├── play/page.tsx
│   │   │       └── pocket/page.tsx
│   │   ├── coach/
│   │   │   ├── layout.tsx            # PIN gate wrapper
│   │   │   ├── page.tsx              # Coach dashboard
│   │   │   ├── books/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [bookId]/page.tsx
│   │   │   ├── backup/page.tsx
│   │   │   └── export/page.tsx
│   │   └── api/                      # Coach-only API routes
│   │       ├── books/route.ts
│   │       ├── books/[bookId]/route.ts
│   │       ├── illustrations/route.ts
│   │       ├── backup/route.ts
│   │       └── export/[bookId]/route.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx          # Safe-area, max-width, calm background
│   │   │   ├── PageTransition.tsx    # Framer Motion wrapper
│   │   │   └── BackButton.tsx        # Gentle navigation (no “exit game” feel)
│   │   ├── home/
│   │   │   ├── AnimatedBackpack.tsx  # Floating backpack hero
│   │   │   └── BackpackReveal.tsx    # Opens to show objects
│   │   ├── backpack/
│   │   │   ├── StoryObject.tsx       # Single object tile (Green Brick, etc.)
│   │   │   └── ObjectGrid.tsx
│   │   ├── story/
│   │   │   ├── StoryEngine.tsx       # Core reusable reader
│   │   │   ├── StoryPage.tsx         # One page: illustration + text
│   │   │   ├── StoryProgress.tsx     # Dot progress (non-gamified)
│   │   │   └── StoryControls.tsx     # Prev/next; no timer
│   │   ├── wonder/
│   │   │   ├── WonderCarousel.tsx
│   │   │   └── QuestionCard.tsx      # One question per screen
│   │   ├── play/
│   │   │   ├── ActivityHost.tsx      # Renders activity by type
│   │   │   └── activities/
│   │   │       ├── TapExplore.tsx
│   │   │       ├── DragExplore.tsx
│   │   │       └── DrawSpace.tsx     # Simple canvas, no scoring
│   │   ├── pocket/
│   │   │   ├── ReflectionCard.tsx
│   │   │   └── TakeawayCard.tsx
│   │   ├── characters/
│   │   │   ├── Leo.tsx               # Optional inline character art
│   │   │   └── Pip.tsx
│   │   ├── coach/
│   │   │   ├── PinGate.tsx
│   │   │   ├── BookEditor.tsx
│   │   │   ├── PageEditor.tsx
│   │   │   ├── QuestionEditor.tsx
│   │   │   ├── ActivityEditor.tsx
│   │   │   ├── IllustrationUploader.tsx
│   │   │   ├── BackupPanel.tsx
│   │   │   └── ExportPanel.tsx
│   │   └── ui/                       # Primitives (Button, Card, Typography)
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Typography.tsx
│   │       └── SafeImage.tsx         # Next/Image with fallbacks
│   │
│   ├── lib/
│   │   ├── books/
│   │   │   ├── loader.ts             # Load & merge bundled + IndexedDB
│   │   │   ├── registry.ts           # Parse index.json
│   │   │   ├── validator.ts          # Zod schemas
│   │   │   └── types.ts              # Shared TS types (inferred from Zod)
│   │   ├── progress/
│   │   │   └── progress-store.ts     # Per-book page index, completed sections
│   │   ├── coach/
│   │   │   ├── auth.ts               # PIN hash, session flag
│   │   │   ├── content-store.ts      # IndexedDB CRUD for edits
│   │   │   ├── backup.ts             # ZIP export/import
│   │   │   └── export-pdf.ts
│   │   ├── storage/
│   │   │   └── db.ts                 # Dexie schema
│   │   ├── constants/
│   │   │   ├── objects.ts            # Story object definitions (8 objects)
│   │   │   ├── theme.ts              # Colours, motion presets
│   │   │   └── routes.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── asset-path.ts         # Resolve illustration URLs
│   │
│   ├── hooks/
│   │   ├── useBook.ts
│   │   ├── useStoryProgress.ts
│   │   ├── useCoachSession.ts
│   │   └── useReducedMotion.ts       # Respect prefers-reduced-motion
│   │
│   └── styles/
│       └── globals.css               # Tailwind + CSS variables (warm palette)
│
├── scripts/
│   ├── validate-stories.ts           # CI: validate all JSON against Zod
│   └── seed-index.ts                 # Regenerate stories/index.json
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── ARCHITECTURE.md                   # This document
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Folder rationale

| Path | Purpose |
|------|---------|
| `stories/` | **Content root** — editable without touching React code; one folder per book |
| `stories/index.json` | Lightweight registry so Home/Backpack never loads 100 full books |
| `src/app/` | Route-based code splitting; each journey stage is its own route |
| `src/components/story/StoryEngine.tsx` | Single reader component used by every book |
| `src/lib/books/` | All loading, validation, merging logic — keeps components thin |
| `src/lib/coach/` | Coach-only persistence; child routes never import these |
| `public/` | PWA assets only; illustrations live under `stories/` for co-location with JSON |

---

## 5. User Journeys & Routing

### 5.1 Child flow

```
Home (/)
  → tap backpack
Backpack (/backpack)
  → tap story object (e.g. Green Brick)
Choose Story (/backpack/green-brick)   [skipped if 1:1 object→book]
  → select book
Story (/story/[bookId])
  → page-by-page reading
Wonder Together (/story/[bookId]/wonder)
  → one question per screen, swipe/tap
Play Together (/story/[bookId]/play)
  → gentle activity
Pip's Pocket (/story/[bookId]/pocket)
  → reflection + takeaway → return home
```

### 5.2 Coach flow

- Hidden entry: **long-press logo** or **triple-tap footer** → `/coach` PIN modal
- After PIN: dashboard to list/edit books, upload art, edit questions/activities, backup ZIP, export PDF
- Coach edits write to **IndexedDB overlay**; optional “Publish to files” for dev/export

### 5.3 Progress memory (non-gamified)

Stored locally per `bookId`:

```typescript
{
  lastPageIndex: number;
  completedStory: boolean;
  completedWonder: boolean;
  completedPlay: boolean;
  completedPocket: boolean;
  lastVisitedAt: string; // ISO — for resume, not streaks
}
```

**No** streak counters, stars, or “you’re 80% done” messaging. Resume is a soft “Shall we continue?” on re-entry.

---

## 6. Story Objects (Backpack Items)

Defined in `src/lib/constants/objects.ts` and referenced by `meta.json`:

| Object ID | Display name | Visual role |
|-----------|--------------|-------------|
| `green-brick` | Green Brick | Building / patience themes |
| `radio` | Radio | Communication / listening |
| `wall` | Wall | Boundaries / feeling stuck |
| `volcano` | Volcano | Big feelings |
| `backpack` | Backpack | Carrying worries / preparation |
| `treasure-map` | Treasure Map | Discovery / goals |
| `battery` | Battery | Energy / rest |
| `puzzle-piece` | Puzzle Piece | Fitting in / identity |
| `compass` | Compass | Direction / choices |

Each object maps to **one or more** books via `meta.json → objectId`. v1 ships with **one book per object** (9 books); registry supports many-to-one later.

---

## 7. Component Catalogue

### 7.1 Layout & shell

| Component | Responsibility |
|-----------|----------------|
| `AppShell` | Warm gradient background, safe areas, optional Pip corner presence |
| `PageTransition` | Shared Framer Motion `layoutId` / fade-slide between routes |
| `BackButton` | Large touch target; label “Back” not “Quit” |

### 7.2 Home & backpack

| Component | Responsibility |
|-----------|----------------|
| `AnimatedBackpack` | Hero SVG/image; slow float (`y: [0, -8, 0]`, 4s loop) |
| `BackpackReveal` | On tap, scale-open animation; reveals `ObjectGrid` |
| `StoryObject` | Object illustration + subtle idle wiggle |
| `ObjectGrid` | Responsive grid; filters books by `objectId` via registry |

### 7.3 Story engine (core)

| Component | Responsibility |
|-----------|----------------|
| `StoryEngine` | Accepts `bookId`; loads `story.json`; manages page state |
| `StoryPage` | Full-bleed illustration (top 65%) + story text (bottom 35%) |
| `StoryProgress` | Minimal dots; no numbers |
| `StoryControls` | Previous / Next; last page → “Wonder Together” CTA |

**StoryEngine props:**

```typescript
interface StoryEngineProps {
  bookId: string;
  onComplete?: () => void;
  initialPageIndex?: number;
}
```

### 7.4 Post-story sections

| Component | Responsibility |
|-----------|----------------|
| `WonderCarousel` | Full-screen question cards; keyboard/swipe |
| `QuestionCard` | Large typography; optional Pip illustration |
| `ActivityHost` | Reads `activity.json` → dispatches to activity component |
| `ReflectionCard` / `TakeawayCard` | Pip's Pocket; calm closing tone |

### 7.5 Coach components

| Component | Responsibility |
|-----------|----------------|
| `PinGate` | 4–6 digit PIN; hashed with Web Crypto; sessionStorage flag |
| `BookEditor` | Tabs: Meta, Story pages, Wonder, Play, Pocket |
| `PageEditor` | WYSIWYG-ish: text fields + illustration preview/upload |
| `IllustrationUploader` | Accept webp/png; resize client-side; store blob in IndexedDB |
| `BackupPanel` | Export/import full `stories/` as ZIP |
| `ExportPanel` | Generate printable PDF of story + questions |

### 7.6 Character components

`Leo` and `Pip` are **optional decorative** components (SVG or PNG sprites) used in UI chrome—not hardcoded into story text. Story content references characters by name in JSON prose only.

---

## 8. JSON Schemas

All schemas validated with **Zod** at build time (`scripts/validate-stories.ts`) and runtime (coach saves).

### 8.1 `stories/index.json` (registry)

```json
{
  "version": 1,
  "books": [
    {
      "id": "book01",
      "objectId": "green-brick",
      "title": "The Green Brick",
      "subtitle": "A story about waiting",
      "coverIllustration": "illustrations/cover.webp",
      "sortOrder": 1,
      "locale": "en-GB",
      "enabled": true
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `version` | number | yes | Schema version for migrations |
| `books[].id` | string | yes | Folder name; kebab or bookNN |
| `books[].objectId` | string | yes | Links to backpack object |
| `books[].title` | string | yes | Child-facing |
| `books[].subtitle` | string | no | Soft context for coach |
| `books[].coverIllustration` | string | yes | Relative to book folder |
| `books[].sortOrder` | number | yes | Grid ordering |
| `books[].locale` | string | yes | BCP-47; future i18n |
| `books[].enabled` | boolean | yes | Hide without deleting |

---

### 8.2 `meta.json` (per book)

```json
{
  "id": "book01",
  "objectId": "green-brick",
  "title": "The Green Brick",
  "description": "Leo finds a green brick that doesn't seem to fit anywhere.",
  "characters": ["leo", "pip"],
  "tags": ["patience", "school"],
  "estimatedMinutes": 8,
  "version": 1
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `estimatedMinutes` | number | no | **Coach-only** hint; never shown as timer to child |
| `tags` | string[] | no | Coach filtering |
| `characters` | enum[] | no | `leo` \| `pip` |

---

### 8.3 `story.json` (pages)

```json
{
  "version": 1,
  "bookId": "book01",
  "pages": [
    {
      "id": "page-01",
      "illustration": "illustrations/page-01.webp",
      "text": "Leo looked at the green brick in his hand.",
      "narration": null,
      "layout": "illustration-top"
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `pages[].id` | string | yes | Stable ID for progress |
| `pages[].illustration` | string | yes | Relative path |
| `pages[].text` | string | yes | Plain text; future markdown subset |
| `pages[].narration` | string \| null | no | **Future:** audio file path |
| `pages[].layout` | enum | no | `illustration-top` \| `full-bleed` \| `text-only` |

**Page transition behaviour:** `StoryEngine` uses Framer Motion crossfade; `prefers-reduced-motion` → instant cut.

---

### 8.4 `coach.json` (Wonder Together)

```json
{
  "version": 1,
  "bookId": "book01",
  "intro": "Wonder Together is a quiet time to talk. There are no right answers.",
  "questions": [
    {
      "id": "q1",
      "text": "Have you ever felt like something didn't fit?",
      "pipNote": "Pip wonders if Leo felt that way too.",
      "order": 1
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `intro` | string | no | Shown once before first question |
| `questions[].text` | string | yes | Large-type child/coach prompt |
| `questions[].pipNote` | string | no | Optional Pip curiosity line—not blame |
| `questions[].order` | number | yes | Display order |

---

### 8.5 `activity.json` (Play Together)

```json
{
  "version": 1,
  "bookId": "book01",
  "title": "Build together",
  "instructions": "Tap the bricks to see what happens.",
  "type": "tap-explore",
  "config": {
    "items": [
      { "id": "brick-1", "label": "Green brick", "image": "illustrations/brick.webp" }
    ],
    "feedback": [
      { "itemId": "brick-1", "message": "It wobbles, but it stays." }
    ]
  },
  "completionMessage": "You explored together. That's enough."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | enum | yes | `tap-explore` \| `drag-explore` \| `draw-space` \| `custom` |
| `config` | object | yes | Type-specific; validated by discriminated union |
| `completionMessage` | string | yes | No score; gentle closure |

**Activity types (v1):**

- `tap-explore` — tap items for soft feedback
- `drag-explore` — drag without snap-fail; everything rests somewhere valid
- `draw-space` — free draw; no eraser shame copy

---

### 8.6 `pocket.json` (Pip's Pocket)

```json
{
  "version": 1,
  "bookId": "book01",
  "reflection": {
    "prompt": "Something Pip noticed",
    "text": "Sometimes things take time to find their place."
  },
  "takeaway": {
    "label": "For your pocket",
    "text": "You can keep wondering. You don't have to figure it all out today."
  },
  "closingIllustration": "illustrations/pip-pocket.webp"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `reflection` | object | yes | One reflection — not a “lesson” |
| `takeaway` | object | yes | One takeaway — pocket-sized thought |
| `closingIllustration` | string | no | Pip with yellow backpack |

**Copy guidelines enforced in coach validator (warnings):**

- Flag words: “should”, “must learn”, “diagnosis”, “disorder”, “naughty”
- Pip lines must not assign blame

---

## 9. Data Loading & Merging Strategy

### 9.1 Bundled content (default)

At build time, Next.js serves `stories/` as static imports or public files. `loader.ts`:

1. Read `stories/index.json`
2. For route `/story/[bookId]`, dynamic import only that book's JSON files
3. Resolve illustration paths relative to book folder

### 9.2 Coach overlay (IndexedDB)

When coach edits content:

```
Effective book = merge(bundledBook, indexedDBOverlay[bookId])
```

- Overlay stores only changed fields (JSON Patch or full document per file)
- Child app reads merged result transparently
- “Reset to original” clears overlay for that book

### 9.3 Scaling to 100 books

| Technique | Benefit |
|-----------|---------|
| Registry in `index.json` | O(1) metadata list; ~100 entries ≈ few KB |
| Lazy load per book | Only active book JSON in memory |
| Image `webp` + responsive sizes | Bandwidth-friendly PWA |
| Route-level splitting | Each stage is separate chunk |
| Validation script in CI | Broken JSON never ships |

---

## 10. Design System

### 10.1 Colour tokens (CSS variables)

```css
--color-cream: #FFF8F0;
--color-peach: #FFD4B8;
--color-sky: #B8D4FF;
--color-pip-blue: #6BA3FF;
--color-pip-yellow: #FFD93D;
--color-ink: #2D3436;
--color-ink-soft: #636E72;
--color-success-soft: #A8E6CF;  /* never “correct answer” green */
```

Warm, comic-book outlines via `border-2 border-ink` on cards; illustrations carry primary emotional weight.

### 10.2 Typography

- **Display:** Nunito or similar rounded sans — large story text (min 22px mobile)
- **Body:** Same family; Wonder questions at 28–36px
- Line height ≥ 1.6 for readability

### 10.3 Motion presets

| Name | Use | Duration |
|------|-----|----------|
| `float` | Backpack, Pip idle | 4s loop |
| `page-turn` | Story pages | 400ms ease |
| `gentle-scale` | Button press | 150ms |

Always honour `useReducedMotion()`.

### 10.4 Art direction implementation

- `SafeImage` wraps `next/image` with rounded corners, subtle shadow
- Consistent aspect ratio containers (4:3 illustration area)
- Placeholder SVG silhouettes until reference artwork is supplied
- **Reference artwork** will live in `stories/bookNN/illustrations/` — components never embed hardcoded art paths except placeholders

---

## 11. Coach Mode & Security

### 11.1 PIN model

- Default PIN set on first coach visit; stored as **SHA-256 hash** in localStorage
- Session flag in `sessionStorage` (clears on tab close)
- No network auth in v1

### 11.2 Capabilities

| Feature | Implementation |
|---------|----------------|
| Edit books | CRUD via `BookEditor` → IndexedDB |
| Add books | New folder structure in overlay + registry update |
| Upload artwork | Blob store in IndexedDB; path references in JSON |
| Edit questions / activities | Forms bound to `coach.json` / `activity.json` |
| Export PDF | Server route renders story pages + questions |
| Backup library | ZIP of all JSON + illustrations (bundled + overlay) |

### 11.3 Child safety

- Coach routes excluded from child navigation
- No external links in child UI
- No user-generated content visible to child without coach publish step

---

## 12. PWA & Offline

### 12.1 Manifest

```json
{
  "name": "Pip's Backpack",
  "short_name": "Pip's Backpack",
  "description": "Stories to help children feel understood",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF8F0",
  "theme_color": "#6BA3FF",
  "orientation": "any"
}
```

### 12.2 Caching strategy

| Asset | Strategy |
|-------|----------|
| App shell (JS/CSS) | Precache on install |
| `stories/**/*.json` | Cache on first read; stale-while-revalidate |
| Illustrations | Cache-first; large quota request on first run |
| Coach uploads (IndexedDB) | Always local; not in SW cache |

### 12.3 Offline UX

- Child flow fully offline after first load
- Offline indicator: soft banner “You're reading at home in Pip's world” — not alarming
- Coach export requires online only if using server PDF route; backup ZIP works offline

---

## 13. Future Extension Points

| Feature | Hook |
|---------|------|
| **Localisation** | `stories/book01/locales/fr-FR/story.json`; loader accepts `locale` param |
| **Narration** | `pages[].narration` → audio path; `StoryPage` optional play button |
| **CMS** | Replace `loader.ts` backend; schemas unchanged |
| **Cloud sync** | `lib/sync/` interface; conflict resolution on coach side |
| **Accessibility** | ARIA on StoryControls; high-contrast theme token set |

---

## 14. Testing Strategy

| Layer | What |
|-------|------|
| Unit | Zod validators; merge logic; progress store |
| Component | StoryEngine page nav; WonderCarousel |
| E2E | Full child path: Home → Pocket for fixture book |
| Content | `validate-stories.ts` in CI for all books |

---

## 15. Initial Content Plan (v1 seed)

Ship **1 complete sample book** (`book01` — Green Brick) with placeholder illustrations + **stub registry entries** for remaining 8 objects (disabled until content ready). This proves architecture without blocking on 9 full stories.

---

## 16. Key Decisions Log

| Decision | Alternatives considered | Why chosen |
|----------|-------------------------|------------|
| App Router | Pages Router | Layouts, loading.tsx, cleaner nested story routes |
| JSON in `stories/` not DB | CMS-only | Git-reviewable; works offline; coach overlay for edits |
| IndexedDB for coach edits | Write to filesystem | Browser security; export/import for portability |
| Separate JSON files per concern | Single monolithic book.json | Easier partial edit; Wonder/Play/Pocket teams can work independently |
| Zod validation | JSON Schema only | Runtime + TS inference in one |
| No child-facing progress gamification | Badges | Aligns with therapeutic philosophy |
| Lazy load books | Bundle all | Required for 100-book scale |
| Placeholder art first | Block on final art | Architecture-first per brief |
| Dexie | raw IndexedDB | Simpler queries for overlay CRUD |
| `@serwist/next` | next-pwa | next-pwa unmaintained; Serwist is modern SW toolkit |

---

## 17. Open Questions for Approval

1. **PIN entry UX:** Long-press logo vs. hidden corner tap — preference?
2. **Sample book:** Should `book01` (Green Brick) include full placeholder copy for all pages in v1?
3. **Object → book mapping:** Confirm 1:1 for launch (9 books) or fewer enabled stubs?
4. **Reference artwork:** Will assets be supplied per book before polish pass, or use procedural placeholders throughout v1?
5. **PDF export:** Client-only (lighter) vs. server route (better print quality)?
6. **Default locale:** `en-GB` as specified, or `en-US`?
7. **Coach PIN default:** Force set on first entry vs. default `1234` with mandatory change prompt?

---

## 18. Implementation Phases (post-approval)

| Phase | Scope |
|-------|-------|
| **1** | Next.js scaffold, design tokens, AppShell, PWA shell |
| **2** | Book loader, Zod schemas, `StoryEngine`, sample `book01` |
| **3** | Home + Backpack + object grid |
| **4** | Wonder, Play, Pocket sections |
| **5** | Progress store + resume |
| **6** | Coach PIN + editors + IndexedDB overlay |
| **7** | Backup ZIP + PDF export |
| **8** | Validation CI, E2E tests, placeholder books in registry |

---

**Please review this architecture and confirm approval (or note changes) before implementation begins.**
