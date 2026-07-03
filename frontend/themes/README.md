# Theme Library

A library of interchangeable UI themes. Every theme shares the **same component
styles and the same token names** — only the colour values differ — so switching
a theme is just loading a different `tokens.css`. Built to grow: add as many
themes as you like.

```
themes/
  registry.json            ← list of all themes + metadata (read this first)
  SHARED.md                ← design rules common to every theme
  _shared.components.css    ← component styles (used by ALL themes)
  gallery.html             ← open in a browser to compare themes live
  teal/   tokens.css + SPEC.md
  indigo/ tokens.css + SPEC.md
  slate/  tokens.css + SPEC.md
```

## Themes included
| Theme | Accent | Feel |
|---|---|---|
| **Teal** (default) | `#0085a8` | Calm, professional, cool |
| **Indigo** | `#4f46e5` | Modern SaaS, still neutral |
| **Slate** | `#334155` | Near-monochrome, most understated |

All three keep the same rule: no fancy colours — colour beyond the accent and
neutrals only ever signals **status**.

## Use a theme in any project
```html
<!-- 1) pick ONE theme's tokens   2) then the shared components -->
<link rel="stylesheet" href="themes/indigo/tokens.css" />
<link rel="stylesheet" href="themes/_shared.components.css" />
```
With Bootstrap: load Bootstrap first, then these two (overrides reskin it).
With Tailwind: copy the chosen theme's palette into `tailwind.config.js`.

## Compare them
Open `gallery.html` in a browser and click the theme buttons at the top — the
same components re-render in each theme.

## Instruct a new build (or an AI)
Point at `SHARED.md` (the rules) + the chosen theme's `SPEC.md` (the palette),
or paste a theme's one-line prompt from its `SPEC.md`.

## Add a new theme
1. `cp -r themes/teal themes/<name>` and edit `<name>/tokens.css`
   (keep every token name; change only the values).
2. Add an entry to `registry.json`.
3. Adjust `<name>/SPEC.md`.
The shared components and the gallery pick it up automatically.

## Switch theme at runtime (optional)
Because all themes use identical token names, you can also swap themes live by
changing which `tokens.css` `<link>` is active (see `gallery.html` for a working
example), or by generating all token sets scoped under
`[data-theme="indigo"]` selectors and toggling the attribute on `<html>`.
