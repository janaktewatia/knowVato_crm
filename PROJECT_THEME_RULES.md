# PROJECT_THEME_RULES.md
# Knowvato — "Indigo Slate ERP" Design System

> Read this file and strictly follow it for all UI, UX, component, page,
> dashboard, table, form, and module development. Never deviate from these
> standards. Choose consistency over creativity. Every new module must look like
> it was built by the same team on the same day using the same design language.

The implemented hex equivalents of the OKLCH tokens (in `frontend/src/styles.css`):

| Token | Hex | Role |
|---|---|---|
| primary (indigo) | `#2249b7` | buttons, links, active nav, focus |
| accent wash | `#e2ebff` | hover tints, avatars |
| background | `#f8fafd` | page background |
| card | `#ffffff` | cards, tables, inputs |
| foreground | `#0e1a30` | primary text |
| muted-foreground | `#596475` | labels, hints |
| border | `#e1e5eb` | borders, dividers |
| success | `#139948` | completed / approved / checked-in |
| warning | `#b07400` | pending / awaiting |
| info | `#009cce` | registered / new / info |
| destructive | `#e62b34` | delete / error / rejected |
| sidebar | `#0f1932` | always-dark navy-indigo rail |
| sidebar-primary | `#5888fc` | active sidebar item |

Radius: cards/dialogs/drawers/tables 14px, containers 10px, buttons/inputs/nav 8px, chips 6px.
Font: system sans stack (no web fonts). Icons: one library only.

---

## Original specification

DESIGN PHILOSOPHY
Build modern, enterprise-grade ERP and SaaS applications with:
Clean and professional appearance
Consistent UI across all modules
High readability
Mobile responsiveness
Accessibility compliance
Fast user interaction
Reusable components
Minimal visual clutter
The UI should feel similar to:
Linear
Notion
Jira
ClickUp
Modern ERP Dashboards
COLOR SYSTEM
Theme Name:Indigo Slate ERP
Primary Color
Rich Indigo
Used For:
Primary buttons
Links
Active navigation
Focus states
Highlights
Background
Near white with subtle cool tint.
Used For:
Page background
Workspace background
Cards
Pure white cards.
Used For:
Dashboard cards
Forms
Tables
Widgets
Sidebar
Always dark.
Even in light mode sidebar remains dark.
Purpose:
Better contrast
Better navigation visibility
Premium ERP appearance
SEMANTIC COLORS
Success
Used For:
Completed
Active
Approved
Checked In
Success Message
Warning
Used For:
Pending
Awaiting Approval
Warning Alerts
Info
Used For:
Registered
New
Information
Draft
Destructive
Used For:
Delete
Error
Rejected
Failed
TYPOGRAPHY
Font Family
Use:
System Sans Stack
Never use decorative fonts.
Never use cursive fonts.
Never use random Google Fonts.
FONT HIERARCHY
Page Title
Size:24px
Weight:600
Examples:
Visitor Management
WhatsApp Campaigns
Event Management
Section Title
Size:18px
Weight:600
Examples:
Visitor Details
Communication Settings
Dashboard Overview
Card Title
Size:16px
Weight:600
Body Text
Size:14px
Weight:400
Table Header
Size:12px
Uppercase
Medium Weight
Tracking Wide
Form Labels
Size:12px
Uppercase
Medium Weight
Muted Color
Button Text
Size:14px
Weight:500
Sidebar Items
Size:14px
Weight:500 Active
Weight:400 Inactive
BORDER RADIUS
Small
6px
Used For:
Small chips
Compact badges
Medium
8px
Used For:
Buttons
Inputs
Dropdowns
Navigation items
Large
10px
Used For:
Standard containers
Extra Large
14px
Used For:
Cards
Dialogs
Drawers
Tables
BUTTON STANDARDS
Primary Button
Use For:
Save
Submit
Create
Generate
Continue
Appearance:
Indigo background
White text
Medium shadow
Rounded medium
Secondary Button
Use For:
Cancel
Reset
Back
Appearance:
Light gray
Dark text
Outline Button
Use For:
Export
Preview
Print
Appearance:
Border only
Destructive Button
Use For:
Delete
Remove
Reject
Appearance:
Red background
CARD STANDARDS
All cards must have:
White background
Border
Rounded XL
Soft shadow
Card Structure:
Header
Content
Footer
Never place content directly without structure.
FORM STANDARDS
Fields:
Input
Textarea
Select
Date Picker
Multi Select
All fields:
Height 36px
Rounded Medium
Border
Focus Ring
Labels:
Always visible.
Never use placeholder as label.
TABLE STANDARDS
Every module should use common reusable table.
Features:
Search
Filter
Export
Column Selector
Pagination
Sorting
TABLE STRUCTURE
Top Bar:
Title
Filters
Actions
Export
Add Button
TABLE HEADER
Uppercase
12px
Medium Weight
Muted Color
TABLE ROWS
Hover effect required.
No zebra striping.
Consistent padding.
STATUS BADGES
Success
Warning
Info
Destructive
Use semantic colors only.
Never invent new colors.
SIDEBAR RULES
Sidebar always dark.
Structure:
Logo
Menu Groups
Menus
Sub Menus
Footer
Version
User Profile
SIDEBAR ACTIVE ITEM
Highlighted
Primary Background
White Text
Small Shadow
ICON STANDARDS
Library:
Lucide React
Sizes:
16px standard
20px mobile
Never mix icon libraries.
DASHBOARD RULES
Dashboard must contain:
Cards
Charts
Recent Activity
Quick Actions
Filters
Analytics
No empty dashboard pages.
PAGE STRUCTURE
Every page should contain:
Header
Page Actions
Filters
Main Content
Footer Actions
MODAL STANDARDS
Use:
Dialog
Sheet
Drawer
Based on context.
Avoid full-page forms when drawer can be used.
RESPONSIVE DESIGN RULES
Must work on:
Desktop
Tablet
Mobile
No horizontal scroll.
No hidden functionality.
ACCESSIBILITY RULES
Keyboard navigation supported.
Focus states visible.
Proper color contrast.
Labels mandatory.
REUSABLE COMPONENTS
Use common components:
Button
Input
Select
Date Picker
Table
Filter Panel
Right Drawer
Modal
Status Badge
Card
Never create duplicate components.
DO NOTS (VERY IMPORTANT)
Do not use random Tailwind colors.
Do not use hardcoded colors.
Do not use hex values directly inside components.
Do not use text-white.
Do not use bg-blue-500.
Do not use bg-red-500.
Do not use bg-slate-900.
Do not use random Google Fonts.
Do not use multiple icon libraries.
Do not use different button styles in different modules.
Do not use different table designs in different modules.
Do not use different card styles in different modules.
Do not create separate filter UIs for every page.
Do not create duplicate components.
Do not use inline styles.
Do not use CSS !important.
Do not use inconsistent spacing.
Do not create pages without loading states.
Do not create pages without empty states.
Do not create pages without error handling.
Do not break mobile responsiveness.
Do not use browser alert().
Do not use confirm() dialogs.
Do not use custom shadows outside design system.
Do not create pages without permission checks.
Do not hardcode API URLs.
Do not hardcode user roles.
Do not hardcode environment values.
DEVELOPMENT RULES
All new modules must follow:
Same layout
Same sidebar
Same header
Same table
Same filters
Same forms
Same buttons
Same spacing
Same permissions structure
Modules should feel like part of one unified product.
FINAL RULE
If a developer, AI tool, Cursor, Copilot, Lovable, or ChatGPT is unsure about a UI decision:
Choose consistency over creativity.
Every new module must look like it was built by the same team on the same day using the same design language.
Use this file as 
PROJECT_THEME_RULES.md
 and tell Cursor/Copilot/Lovable:
Read PROJECT_THEME_RULES.md and strictly follow it for all future UI, UX, component, page, dashboard, table, form, and module development. Never deviate from these standards.
Color Theme Prompt — "Indigo Slate ERP"Use this enterprise-grade color system built on OKLCH color space with semantic design tokens. All colors are defined in src/styles.css and consumed via Tailwind utility classes (e.g. bg-primary, text-muted-foreground).
Design PhilosophyModern ERP / admin dashboard aesthetic. Cool indigo primary on a near-white slate background, with a deep navy-indigo sidebar for contrast. Semantic status colors (success/warning/info/destructive) follow the same tonal family. Full light + dark mode parity.
Light Mode Tokens--radius: 0.625rem;
/* Surfaces 
/--background: oklch(0.985 0.005 250); /
 near-white, faint cool tint 
/--foreground: oklch(0.18 0.04 260); /
 deep slate-indigo text 
/--card: oklch(1 0 0); /
 pure white cards */--card-foreground: oklch(0.18 0.04 260);--popover: oklch(1 0 0);--popover-foreground: oklch(0.18 0.04 260);
/* Brand 
/--primary: oklch(0.45 0.18 265); /
 rich indigo 
/--primary-foreground: oklch(0.99 0 0); /
 white on primary */
/* Neutrals 
/--secondary: oklch(0.96 0.01 260); /
 very light cool gray 
/--secondary-foreground: oklch(0.25 0.05 265);--muted: oklch(0.96 0.008 260);--muted-foreground: oklch(0.5 0.03 260); /
 mid-gray for hints 
/--accent: oklch(0.94 0.04 265); /
 soft indigo wash */--accent-foreground: oklch(0.3 0.1 265);
/* Semantic status 
/--destructive: oklch(0.6 0.22 25); /
 red 
/--destructive-foreground: oklch(0.99 0 0);--success: oklch(0.6 0.16 150); /
 green 
/--success-foreground: oklch(0.99 0 0);--warning: oklch(0.78 0.16 75); /
 amber 
/--warning-foreground: oklch(0.2 0.05 60);--info: oklch(0.65 0.15 230); /
 sky blue */--info-foreground: oklch(0.99 0 0);
/* Borders & inputs 
/--border: oklch(0.92 0.01 260);--input: oklch(0.92 0.01 260);--ring: oklch(0.55 0.18 265); /
 focus ring = indigo */
/* Charts (indigo, sky, green, amber, magenta) */--chart-1: oklch(0.55 0.18 265);--chart-2: oklch(0.65 0.15 230);--chart-3: oklch(0.65 0.16 150);--chart-4: oklch(0.75 0.16 75);--chart-5: oklch(0.6 0.2 320);
/* Sidebar — deep navy-indigo, always darker than main bg 
/--sidebar: oklch(0.22 0.05 265);--sidebar-foreground: oklch(0.92 0.01 260);--sidebar-primary: oklch(0.65 0.18 265); /
 active item bg 
/--sidebar-primary-foreground: oklch(0.99 0 0);--sidebar-accent: oklch(0.3 0.06 265); /
 hover bg */--sidebar-accent-foreground: oklch(0.99 0 0);--sidebar-border: oklch(0.3 0.05 265);--sidebar-ring: oklch(0.55 0.18 265);Dark Mode Tokens.dark --background: oklch(0.16 0.03 260);--foreground: oklch(0.96 0.005 260);--card: oklch(0.22 0.04 260);--card-foreground: oklch(0.96 0.005 260);--popover: oklch(0.22 0.04 260);--popover-foreground: oklch(0.96 0.005 260);
--primary: oklch(0.7 0.17 265); /* lighter indigo for dark bg */--primary-foreground: oklch(0.15 0.03 260);
--secondary: oklch(0.28 0.04 260);--secondary-foreground: oklch(0.96 0.005 260);--muted: oklch(0.28 0.04 260);--muted-foreground: oklch(0.7 0.02 260);--accent: oklch(0.32 0.06 265);--accent-foreground: oklch(0.96 0.005 260);
--destructive: oklch(0.65 0.2 25);--destructive-foreground: oklch(0.99 0 0);--success: oklch(0.65 0.15 150);--success-foreground: oklch(0.15 0.03 260);--warning: oklch(0.78 0.16 75);--warning-foreground: oklch(0.15 0.03 260);--info: oklch(0.7 0.14 230);--info-foreground: oklch(0.15 0.03 260);
--border: oklch(1 0 0 / 10%); /* translucent white border */--input: oklch(1 0 0 / 15%);--ring: oklch(0.65 0.18 265);
--chart-1: oklch(0.7 0.17 265);--chart-2: oklch(0.7 0.14 230);--chart-3: oklch(0.7 0.15 150);--chart-4: oklch(0.78 0.16 75);--chart-5: oklch(0.7 0.18 320);
--sidebar: oklch(0.18 0.04 265);--sidebar-foreground: oklch(0.92 0.01 260);--sidebar-primary: oklch(0.7 0.17 265);--sidebar-primary-foreground: oklch(0.99 0 0);--sidebar-accent: oklch(0.28 0.05 265);--sidebar-accent-foreground: oklch(0.99 0 0);--sidebar-border: oklch(1 0 0 / 8%);--sidebar-ring: oklch(0.7 0.17 265);Element-by-Element MappingUI Element Token / ClassPage background bg-backgroundBody text text-foregroundCard / panel bg-card text-card-foreground borderMuted hint text, table sub-labels text-muted-foregroundPrimary CTA button bg-primary text-primary-foregroundSecondary button bg-secondary text-secondary-foregroundOutline button border border-input bg-background hoverGhost button hover hover hoverDestructive / delete bg-destructive text-destructive-foregroundSuccess badge (Checked-In) bg-success text-success-foregroundWarning badge (Pending) bg-warning text-warning-foregroundInfo badge (Registered) bg-info text-info-foregroundInput fields bg-transparent border-inputFocus ring ring-ring (indigo glow)Sidebar background bg-sidebar text-sidebar-foregroundSidebar active item bg-sidebar-primary text-sidebar-primary-foregroundSidebar hover item hover hoverSidebar logo tile bg-sidebar-primaryDividers / borders border-borderCharts (data series 1-5) --chart-1 … --chart-5RulesNever use raw Tailwind colors (text-white, bg-slate-900, bg-[#3B82F6]) in components — always semantic tokens.Sidebar uses its own token family (--sidebar-*) so it stays dark even in light mode.Status colors (success/warning/info/destructive) all carry matching -foreground pairs for AA contrast.The hue stays in the 260–265 indigo band across nearly every neutral, giving the whole UI a unified cool tone.Border radius base is 0.625rem with sm/md/lg/xl derivatives via calc().Paste both blocks into src/styles.css under a @theme inline mapping (Tailwind v4) and you'll reproduce the exact GateFlow look.
Complete Design System Spec — GateFlow VMSHere's the full design language used across the project, element by element.
TypographyFont family: System default stack (no custom web font loaded). Tailwind's default font-sans:
ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serifFont features enabled (in body): "cv02", "cv03", "cv04", "cv11" — stylistic alternates for cleaner numerals & letters (Inter-style).
Font sizes & weights by element:
Element Size Weight TrackingPage H1 / Module title text-2xl (24px) font-semibold (600) tracking-tightSection title text-lg (18px) font-semibold normalCard title text-base (16px) font-semibold tracking-tightCard description text-sm (14px) 400 normalBody text text-sm (14px) 400 normalTable header text-xs (12px) font-medium (500) uppercase tracking-widerTable cell text-sm (14px) 400 normalForm label text-xs (12px) font-medium uppercase tracking-widerInput text text-sm md / text-base mobile 400 normalButton text text-sm (14px) font-medium (500) normalSmall button (sm) text-xs (12px) font-medium normalSidebar nav item text-sm (14px) 500 active / 400 idle normalSidebar brand text-base font-semibold tracking-tightSidebar caption text-[11px] 400 uppercase tracking-widerStatus badge text-xs (12px) font-medium normalStat number (dashboard) text-2xl / text-3xl font-semibold tracking-tightFooter/version text text-xs (12px) 400 normal2. Border RadiusBase token: --radius: 0.625rem (10px). Derivatives via calc():
Token Value Used on--radius-sm calc(0.625 - 4px) = 6px Small chips, tight inputs--radius-md calc(0.625 - 2px) = 8px Buttons, inputs, nav items, badges--radius-lg 0.625rem = 10px Default for most components--radius-xl calc(0.625 + 4px) = 14px Cards, dialogs, sheetsrounded-full 9999px Avatars, dot indicators, close buttonsSpecifics:
Button: rounded-md (8px); small button rounded-md (8px); icon button rounded-mdCard: rounded-xl (14px)Input / Textarea / Select trigger: rounded-md (8px)Badge: rounded-md (8px) or rounded-full for status dotsSidebar nav item: rounded-md (8px)Photo preview: rounded-md (8px)Avatar / circular icon: rounded-full3. ButtonsBase: inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium Sizes:
Size Height Padding Textsm h-8 (32px) px-3 text-xsdefault h-9 (36px) px-4 py-2 text-smlg h-10 (40px) px-8 text-smicon h-9 w-9 — —Variants & colors:
Variant Background Text Hover Shadowdefault bg-primary (indigo oklch(0.45 0.18 265)) text-primary-foreground (near-white oklch(0.99 0 0)) bg-primary/90 shadowdestructive bg-destructive (red oklch(0.6 0.22 25)) text-destructive-foreground (white) bg-destructive/90 shadow-smoutline bg-background + border border-input text-foreground bg-accent text-accent-foreground shadow-smsecondary bg-secondary (oklch(0.96 0.01 260)) text-secondary-foreground (oklch(0.25 0.05 265)) bg-secondary/80 shadow-smghost transparent text-foreground bg-accent text-accent-foreground nonelink transparent text-primary underline noneIcon size inside button: [&_svg] (16px), [&_svg]. Focus ring: focus-visible focus-visible (indigo oklch(0.55 0.18 265)). Disabled: opacity-50 pointer-events-none.
Cardsrounded-xl border bg-card text-card-foreground shadowProperty ValueBackground bg-card  oklch(1 0 0) (pure white) / dark: oklch(0.22 0.04 260)Text color text-card-foreground  oklch(0.18 0.04 260) (deep slate-indigo) / dark: oklch(0.96 0.005 260)Border border  oklch(0.92 0.01 260) / dark: oklch(1 0 0 / 10%)Radius rounded-xl (14px)Shadow shadow (Tailwind default = 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1))Padding Header p-6, Content p-6 pt-0, Footer p-6 pt-0Header gap space-y-1.5Card subparts:
CardTitle  font-semibold leading-none tracking-tight (16px)CardDescription  text-sm text-muted-foreground (oklch(0.5 0.03 260) muted slate)CardContent  14px body text, text-card-foreground5. Inputs / Form FieldsProperty ValueHeight h-9 (36px)Padding px-3 py-1Background bg-transparentBorder border border-input (oklch(0.92 0.01 260))Radius rounded-md (8px)Shadow shadow-smText size text-base mobile, text-sm md+Placeholder text-muted-foregroundFocus ring-1 ring-ring (indigo)Disabled opacity-50 cursor-not-allowedLabel: text-xs uppercase tracking-wider font-medium text-muted-foreground — gives the ERP feel.
Color Tokens (full reference)Light mode--background: oklch(0.985 0.005 250) /* near-white, very faint blue tint 
/--foreground: oklch(0.18 0.04 260) /
 deep slate-indigo body text 
/--card: oklch(1 0 0) /
 pure white 
/--card-foreground: oklch(0.18 0.04 260)--popover / popover-foreground: same as card--primary: oklch(0.45 0.18 265) /
 rich indigo — buttons, links, focus 
/--primary-foreground: oklch(0.99 0 0) /
 near-white on primary 
/--secondary: oklch(0.96 0.01 260) /
 cool gray wash 
/--secondary-foreground: oklch(0.25 0.05 265)--muted: oklch(0.96 0.008 260)--muted-foreground: oklch(0.5 0.03 260) /
 secondary text, hints 
/--accent: oklch(0.94 0.04 265) /
 indigo wash on hover 
/--accent-foreground: oklch(0.3 0.1 265)--destructive: oklch(0.6 0.22 25) /
 red 
/--destructive-foreground: oklch(0.99 0 0)--success: oklch(0.6 0.16 150) /
 green — IN status 
/--warning: oklch(0.78 0.16 75) /
 amber — PENDING 
/--info: oklch(0.65 0.15 230) /
 sky — INFO 
/--border / --input: oklch(0.92 0.01 260)--ring: oklch(0.55 0.18 265) /
 focus ring indigo 
/--chart-1..5: indigo, sky, green, amber, magentaSidebar (always dark, even in light mode)--sidebar: oklch(0.22 0.05 265) /
 deep indigo-slate 
/--sidebar-foreground: oklch(0.92 0.01 260) /
 near-white 
/--sidebar-primary: oklch(0.65 0.18 265) /
 active item bg 
/--sidebar-primary-foreground: oklch(0.99 0 0)--sidebar-accent: oklch(0.3 0.06 265) /
 hover bg */--sidebar-border: oklch(0.3 0.05 265)
Sidebar (always-dark navigation rail)Property ValueWidth w-64 (256px) on lg+, hidden belowBG bg-sidebar (deep indigo-slate)Text text-sidebar-foregroundBorder-right border-sidebar-borderBrand block px-5 py-5, 36x36px primary square w/ rounded-lg iconNav item idle text-sidebar-foreground/80, px-3 py-2, rounded-md, text-smNav item hover bg-sidebar-accent text-sidebar-accent-foregroundNav item active bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-smNav icon h-4 w-4, gap gap-3Footer text-xs text-sidebar-foreground/50, border-tMobile: top bar 56px (h-14) + bottom nav (5 items, text-[10px], h-5 w-5 icons).
Status Badgesinline-flex items-center px-2 py-0.5 rounded-md text-xs font-mediumStatus Background TextIN / Success bg-success (green) text-success-foregroundOUT / Closed bg-secondary text-secondary-foregroundPENDING / Warning bg-warning (amber) text-warning-foregroundINVALID / Error bg-destructive text-destructive-foregroundINFO bg-info (sky) text-info-foreground
TablesProperty ValueContainer rounded-xl border bg-card overflow-hiddenHeader row bg-muted/50, text-xs uppercase tracking-wider font-medium text-muted-foregroundHeader cell padding px-4 py-3Body cell padding px-4 py-3, text-smRow border border-b (last)Row hover hover/30Empty state text-sm text-muted-foreground, centered, py-12
Shadows & ElevationToken Used onshadow-sm Inputs, secondary buttons, outline buttonsshadow Cards (default), primary button(none) Ghost buttons, table rowsSidebar active nav uses shadow-sm for subtle lift
Spacing rhythmPage container: max-w-7xl mx-auto px-4 sm lg py-6Section gap: space-y-6Card grid: grid gap-4 sm lgForm field grid: grid grid-cols-1 sm gap-4Form vertical rhythm: space-y-5Field label-to-input: space-y-1.5
IconographyLibrary: lucide-reactDefault size in buttons: 16px (h-4 w-4)Sidebar nav icons: 16pxMobile bottom nav icons: 20px (h-5 w-5)Stroke width: lucide default (2)That's the complete visual contract — typography scale, radius scale, every button/card/input/sidebar/badge/table spec, and the full token palette. Drop this into any prompt to reproduce the exact GateFlow look.