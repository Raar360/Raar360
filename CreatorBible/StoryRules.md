# Story Rules

## Purpose

Every Pip's Backpack story is a **recognition tool**, not a teaching tool. The child should think: "That's me" — not "I learned a lesson."

## Structure

Each book follows this flow:

```
Story (scenes) → Wonder Together → Play Together → Pip's Pocket
```

| Stage | Source file | Purpose |
|-------|-------------|---------|
| Story | `story.json` | Narrative with composable scenes |
| Wonder Together | `coach.json` | Open-ended discussion questions |
| Play Together | `activity.json` | Gentle interactive exploration |
| Pip's Pocket | `coach.json` | One reflection takeaway |

## Scene Model

Each story page is a **Scene**, not a static illustration. Scenes reference reusable assets from the Asset Library. See `IllustrationRules.md` for visual composition.

## Narrative Rules

### Do

- Show Leo trying his best
- Show time passing without anyone being cross
- Use short paragraphs with breathing room (`\n\n` between beats)
- Let Pip ask "what if" questions
- End with warmth and a small treasure in Pip's backpack
- Use British English spelling (colour, favourite, etc.)

### Do Not

- Diagnose ("Leo has ADHD")
- Moralise ("You should always put your shoes on first")
- Create conflict between Leo and adults
- Use timers, scores, or right/wrong answers
- Make Leo naughty, defiant, or ashamed
- Use "always", "never", or "you must" in reflection text

## Character Presence

| Character | Default presence |
|-----------|-----------------|
| Leo | Every scene |
| Pip | Every scene (except rare solo Leo beats) |
| Dad / Mum | When story requires adult anchor |
| Whiskers | When story involves the cat |

## Dialogue Modes

| Mode | When to use |
|------|-------------|
| `narration` | Default — caption box below scene |
| `speech` | Character speech bubbles in scene |
| `mixed` | Both narration and in-scene speech |
| `none` | Visual-only beat (rare) |

## Progress & Navigation

- No forced linear lock — child can leave anytime
- Progress saved per page index
- No auto-advance — child taps Continue

## Book Metadata

Each book declares its story object in `meta.json` (green-brick, volcano, etc.). The object appears on the backpack grid and may appear as a scene object.

## Adding New Stories

1. Define characters and locations in CreatorBible (if new)
2. Author or reuse Asset Library entries
3. Compose scenes in `story.json`
4. Write wonder questions (open-ended only)
5. Choose one Play Together activity type
6. Write one pocket reflection (not a lesson)
