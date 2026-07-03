# Shared Design Rules (all themes)

Every theme in this library shares these rules. Only the **colour tokens** differ
(see each theme's `SPEC.md` + `tokens.css`). The component stylesheet
`_shared.components.css` is common to all themes and is built entirely on the
token variables, so swapping a theme never breaks layout.

## The one rule about colour
If a colour isn't the **accent** or a **neutral**, it must be carrying a **status
meaning** (success / warning / error / info). Otherwise, don't use it. This is
what keeps every theme calm and "no fancy colours."

## Token contract (identical names in every theme)
`--accent, --accent-hover, --accent-soft, --accent-ink`,
`--page-bg, --surface, --surface-2, --border, --border-2, --divider`,
`--text, --text-2, --muted, --muted-2`,
`--pill-bg, --pill-ink`,
`--ok/--ok-bg, --warn/--warn-bg, --err/--err-bg, --info/--info-bg`,
`--radius, --radius-sm, --shadow-sm, --shadow-md`,
`--font, --fs-base, --fs-sm, --fs-xs`.

Because the names never change, switching themes = loading a different
`tokens.css`. Nothing else.

## Shape, elevation, type
- Radius: cards/inputs `10px`, buttons/controls `7px`, pills `999px`.
- Shadows: cards `--shadow-sm`; popovers/menus `--shadow-md`.
- Font: Inter. Base `14px`; small `12.5px`; table headers `11px` uppercase,
  letter-spacing `.05em`. Page title `17px/600`; card title `14–15px/600`.

## Components (must look the same on every screen)
- **Buttons** — Primary = solid accent; Secondary = white + `--border-2`;
  Tertiary = link in accent; row actions = borderless icon buttons (accent on
  hover, red on delete-hover).
- **Filter bar** — white card, **labels above inputs**, solid accent "Search"
  with leading icon + light "Reset" with a counter-clockwise icon.
- **Tabs** — pill track on `--surface-2`; active tab is white with a small shadow.
- **Tables** — uppercase muted headers; identity cell = avatar + name over a
  muted sub-line; thin `--divider` rows; hover = `--surface-2`; numbers and
  actions right-aligned.
- **Status pills** — soft rounded; neutral by default; coloured only for status.
- **Cards** — white, `10px`, `--border`, `--shadow-sm`; header `600` title with a
  `--divider` underline.
- **Modals** — centred; `16px/600` title + close; footer right-aligned with
  secondary Cancel + primary action.
- **Sidebar/topbar** — white with `--border` edges; active nav = `--accent-soft`
  bg + `--accent-ink` text + accent icon.
- **Avatars** — `--accent-soft` bg, `--accent-ink` initials. No random colours.

## Applying a theme
```html
<!-- pick ONE theme's tokens, then the shared components -->
<link rel="stylesheet" href="themes/teal/tokens.css" />
<link rel="stylesheet" href="themes/_shared.components.css" />
```
With Bootstrap: load Bootstrap first, then these two — the overrides reskin it.
With Tailwind: copy the chosen theme's values into `tailwind.config.js`.

## Adding a new theme
1. `cp -r themes/teal themes/<name>` and edit `tokens.css` (keep all token names).
2. Add an entry to `registry.json`.
3. Write/adjust `<name>/SPEC.md`.
That's it — the shared components and gallery pick it up automatically.
