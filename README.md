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
