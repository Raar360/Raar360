# Pip's Backpack

A calm, therapeutic storytelling platform designed to help children recognise themselves through stories — with conversation guides for coaches and parents.

## Philosophy

- Stories **recognise**, they don't teach or diagnose
- No ads, subscriptions, scoreboards, timers, or addictive mechanics
- All content is **data-driven** from JSON files in `stories/`

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion
- Zod (schema validation)
- Dexie (IndexedDB for progress & coach overrides)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/           → Routes (thin shells)
components/    → UI and feature components
lib/           → Schemas, story loader, storage
stories/       → JSON content (library + books)
public/stories → Illustration assets
docs/          → Architecture documentation
```

## Adding a Book

1. Create `stories/book02/` with `meta.json`, `story.json`, `coach.json`, `activity.json`
2. Add illustrations to `public/stories/book02/illustrations/`
3. Register in `stories/library.json`

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full schema details.

## Coach Mode

Visit `/coach` (also linked subtly from the footer). Set a PIN on first visit to access the story library manager. Full editing tools arrive in Phase 3.

## Build

```bash
npm run build
npm start
```

## Review on your phone (while travelling)

The app is **mobile-first** — every screen is designed for phone-sized viewports with thumb-friendly controls, safe-area padding (notched iPhones), and swipe gestures on Wonder Together.

### Option 1: Vercel preview (recommended)

If this repo is connected to [Vercel](https://vercel.com), each pull request gets a **Preview URL**. Open that link on your phone's browser — no laptop needed.

1. Open the PR on GitHub
2. Find the Vercel bot comment with the preview link (or check the PR "Deployments" section)
3. Open the URL on your phone
4. Optional: **Add to Home Screen** (Safari → Share → Add to Home Screen) for a full-screen app-like experience

### Option 2: Local network (same Wi‑Fi)

If you're running `npm run dev` on a machine on the same network:

```bash
npm run dev -- --hostname 0.0.0.0
```

Then on your phone, open `http://<your-computer-ip>:3000` (e.g. `http://192.168.1.42:3000`).

### Mobile features included

- Sticky bottom action bars on story, wonder, play, and pocket screens
- Swipe left/right between Wonder Together questions
- Continue / Finished badges on the story picker when you return
- 44px+ touch targets throughout
- Illustrations capped in height so Continue buttons stay reachable
- PWA manifest — add to home screen when deployed

