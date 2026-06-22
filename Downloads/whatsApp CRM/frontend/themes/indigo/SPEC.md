# Theme: Indigo (v1)

Modern SaaS feel, still neutral.

This theme follows the shared component rules in `../SHARED.md`. Only the colour
tokens differ — the layout, tables, tabs, buttons, pills and spacing are
identical to every theme in this library.

## Accent + key colours
| Token | Hex | Use |
|---|---|---|
| accent | `#4f46e5` | Primary buttons, active tab/nav, links, focus ring |
| accent-hover | `#4338ca` | Hover/pressed |
| accent-soft | `#eef0fe` | Active nav bg, avatars, tinted fills |
| accent-ink | `#312e81` | Text/icon on accent-soft |
| page background | `#f8f9fc` | App canvas |

Surfaces are white (`#ffffff`); borders, text and muted greys are tuned to suit
the accent (see `tokens.css` for the full set). Semantic status colours
(success / warning / error / info) are shared across all themes and used **only**
to convey meaning.

## Use it
```html
<link rel="stylesheet" href="themes/indigo/tokens.css" />
<link rel="stylesheet" href="themes/_shared.components.css" />
```

## Switch to this theme
Load this theme's `tokens.css` instead of another's — nothing else changes,
because all themes share the same token names and the same components file.

## One-line prompt
> Use accent `#4f46e5` (hover `#4338ca`, soft `#eef0fe`) on page `#f8f9fc`, white
> surfaces, neutral grey borders/text, soft rounded status pills, Inter font,
> 10px card radius — consistent tables/tabs/buttons on every screen, no fancy
> colours.
