# Taste: Visual and UX Direction

## Personality
Calm, precise, a little inky. Tidy should feel like a clean page in a good notebook written with a blue fountain pen: quiet backgrounds, one confident ink-blue accent, nothing shouting.

## Color
One accent, used for primary actions, the checkmark, the strike-through on completed tasks and the top edge of note cards. Priorities are the only other colors, always as soft pills.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#EEF1F6` | `#10131C` | Page background (cool paper) |
| `--surface` | `#FFFFFF` | `#181C28` | Sheet, cards, composer |
| `--surface-2` | `#E4E8F0` | `#222736` | Tab track, hover |
| `--text` | `#16192B` | `#E8EAF2` | Body text |
| `--muted` | `#5E6478` | `#9AA0B4` | Secondary text |
| `--border` | `#D6DBE6` | `#2B3142` | Dividers, outlines |
| `--accent` | `#2440C7` | `#93A6FF` | Ink blue |
| `--danger` | `#C4291C` | `#FF8A7A` | Overdue, errors, delete hover |
| High / Medium / Low | `#B42318` / `#8A5B00` / `#2E6B57` | `#FF9C8C` / `#E9C265` / `#7FD1B2` | Priority pill text |

## Typography
- Font: **Figtree** (Google Fonts), fallback `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`.
- Wordmark "Tidy": 2rem, weight 800, tight letter-spacing (-0.03em). This is the one bold typographic moment.
- Body 16px / 1.5. Metadata 0.8–0.9rem. Weights: 400, 500, 600, 800 only.
- Sentence case everywhere. No all-caps labels.

## Layout
- Single centered column, max-width 680px, 16px side padding on mobile.
- Tasks live on one continuous "sheet" with thin dividers, like lines on a page, not a stack of separate cards.
- Notes are cards in an auto-fill grid (min 220px), each with a 3px ink-blue top edge.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48px.
- Radii: 16px for big surfaces, 10px for inputs, buttons and cards, pill for chips and badges.

## Motion
- Only respond to user actions: new items slide in 6px and fade (250ms); the toast rises from the bottom.
- No animation on page load and none on re-render.
- Buttons press to 97% scale.
- All motion is turned off under `prefers-reduced-motion`.

## Copy
- Buttons say exactly what happens: "Add task", "Save note", "Clear completed".
- Toasts match the action: "Task deleted", "Note deleted", "Cleared 2 completed tasks".
- Errors say what to do: "Type a task title first."
- Empty states invite action: "No tasks yet. Add your first task above to get started."

## Avoid
- Gradients, glassmorphism, neon glows or emoji decoration in the UI.
- Multiple accent colors competing with each other.
- Heavy drop shadows under every element.
- Tracked-out uppercase labels, "→" arrows on buttons, or placeholder lorem ipsum.
- Browser-default unstyled checkboxes and selects next to styled elements.
