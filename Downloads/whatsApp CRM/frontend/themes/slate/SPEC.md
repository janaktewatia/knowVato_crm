# Theme: Slate (v1)

Near-monochrome, maximally understated.

This theme follows the shared component rules in `../SHARED.md`. Only the colour
tokens differ — the layout, tables, tabs, buttons, pills and spacing are
identical to every theme in this library.

## Accent + key colours
| Token | Hex | Use |
|---|---|---|
| accent | `#334155` | Primary buttons, active tab/nav, links, focus ring |
| accent-hover | `#1e293b` | Hover/pressed |
| accent-soft | `#eef1f5` | Active nav bg, avatars, tinted fills |
| accent-ink | `#1e293b` | Text/icon on accent-soft |
| page background | `#f8fafc` | App canvas |

Surfaces are white (`#ffffff`); borders, text and muted greys are tuned to suit
the accent (see `tokens.css` for the full set). Semantic status colours
(success / warning / error / info) are shared across all themes and used **only**
to convey meaning.

## Use it
```html
<link rel="stylesheet" href="themes/slate/tokens.css" />
<link rel="stylesheet" href="themes/_shared.components.css" />
```

## Switch to this theme
Load this theme's `tokens.css` instead of another's — nothing else changes,
because all themes share the same token names and the same components file.

## One-line prompt
> Use accent `#334155` (hover `#1e293b`, soft `#eef1f5`) on page `#f8fafc`, white
> surfaces, neutral grey borders/text, soft rounded status pills, Inter font,
> 10px card radius — consistent tables/tabs/buttons on every screen, no fancy
> colours.
