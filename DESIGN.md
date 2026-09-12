---
name: SafraScore
description: Prevenção à inadimplência no crédito de insumo agrícola — score de safra antes da colheita
colors:
  paper-cream: "#f5f3ea"
  warm-husk: "#efece1"
  deep-ink-green: "#1b2a1a"
  soft-ink: "#3c4a39"
  field-green: "#2d6a3f"
  field-green-deep: "#234f30"
  ink-hairline: "rgba(27, 42, 26, 0.14)"
typography:
  display:
    fontFamily: "-apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.75rem, 7.5vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "-apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.12em"
rounded:
  sm: "3px"
  full: "9999px"
spacing:
  xs: "0.75rem"
  sm: "1.5rem"
  md: "3rem"
  lg: "5.5rem"
components:
  button-primary:
    backgroundColor: "{colors.field-green}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.72rem 1.4rem"
  button-primary-hover:
    backgroundColor: "{colors.field-green-deep}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.deep-ink-green}"
    rounded: "{rounded.sm}"
    padding: "0.72rem 1.4rem"
  button-secondary-hover:
    textColor: "{colors.deep-ink-green}"
  link:
    textColor: "{colors.field-green}"
    typography: "{typography.label}"
  link-hover:
    textColor: "{colors.field-green-deep}"
---

# Design System: SafraScore

## Overview

**Creative North Star: "The Field Ledger"**

SafraScore reads two things a balance sheet can't show — whether the safra will exist, and whether it will be worth enough — and turns them into a score a credit analyst can act on before the harvest. The visual system carries that same discipline: a ledger, not a dashboard. Paper-toned ground, ink-dark type, hairline rules instead of cards or shadows, one accent color used sparingly for action and evidence. Where the product needs to prove it understands the actual crop, it says so with a real aerial photograph, not an icon — the plantation grid rendered first in abstract line-work behind the hero, then made literal in the photo beside it.

The system rejects the two easy defaults for an agro product: it is not a saturated "green tech" palette selling optimism, and it is not a generic SaaS gradient-and-card template. It is closer to a well-kept paper ledger crossed with an aerial survey map — legible, unhurried, confident enough to leave most of the page empty.

**Key Characteristics:**
- Paper-cream ground with ink-dark text; no white, no pure black, anywhere.
- Flat by construction — zero shadows, all separation from hairline borders or a shift in paper tone.
- One system font (the platform's own), carrying the entire hierarchy through size, weight, and tracking alone.
- A single accent (Field Green) spent only on the action a visitor should take and the evidence behind a claim.
- Real aerial photography as a second, literal register beneath the abstract line-grid motif — never both competing for the same space.

## Colors

Warm, desaturated, paper-and-ink — the palette of a printed report, not a screen.

### Primary
- **Field Green** (`#2d6a3f`): The only accent in the system. Reserved for the primary button fill, links, and small evidentiary marks (a source line under a claim, a step label). It never appears as a background fill larger than a button.
- **Field Green Deep** (`#234f30`): Field Green's hover/active state — a single step darker, never a separate role.

### Neutral
- **Deep Ink Green** (`#1b2a1a`): Primary text and headings. Reads as near-black but carries the same hue family as Field Green, so headings and accent never clash.
- **Soft Ink** (`#3c4a39`): Body copy and secondary text — Deep Ink Green diluted, not a separate gray.
- **Paper Cream** (`#f5f3ea`): The page ground. Fixed — this surface does not follow light/dark mode, on purpose (see Do's and Don'ts).
- **Warm Husk** (`#efece1`): The alternate section ground, one step warmer/darker than Paper Cream. Used to separate stacked sections without a border.
- **Ink Hairline** (`rgba(27, 42, 26, 0.14)`): Every border, divider, and outline in the system. It is Deep Ink Green at low opacity, not an unrelated gray — this is why hairlines never look cold against the warm ground.

### Named Rules
**The One Accent Rule.** Field Green is the only saturated color in the system. If a second accent seems needed, the answer is almost always weight, size, or a hairline — not a new hue.

## Typography

**Display / Body / Label Font:** the platform system stack (`-apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) — no webfont is loaded.

**Character:** One typeface carries every role. Hierarchy comes entirely from size, weight, and negative tracking on the largest sizes — a deliberate constraint that reads as restraint rather than as an unfinished type system.

### Hierarchy
- **Display** (700, `clamp(2.75rem, 7.5vw, 5.25rem)`, line-height 1.02, tracking -0.03em): the hero headline only. Balanced line breaks (`text-wrap: balance`), max-width ~15ch so it never runs past two confident lines.
- **Headline** (700, `clamp(1.8rem, 3.4vw, 2.6rem)`, line-height 1.12, tracking -0.02em): section headings (`h2`). Max-width ~24ch, also balanced.
- **Title** (700, 1.35rem down to 1.1rem depending on density, line-height ~1.5, tracking -0.01em to normal): sub-section headings (`h3`) — the two-column "signal" cards use the larger step, the four-step process list the smaller one.
- **Body** (400, 1rem, line-height 1.65–1.7): supporting paragraphs. The hero lede is a distinct, larger body variant (`clamp(1.05rem, 1.5vw, 1.2rem)`, line-height 1.75, color Soft Ink) — used once per page, never for secondary copy.
- **Label** (700, 0.8rem, line-height 1.5, tracking 0.12em): the step-number marks ("01"–"04") in Field Green. A second, unweighted label variant (400, 0.85rem, Field Green, no tracking) marks the data-source line under each claim ("Índice ONI (NOAA) × …") — quieter than the numbered label, used for citation rather than sequence.

### Named Rules
**The No-Eyebrow Rule.** No small-caps label sits above a heading to announce its topic. Every heading carries its own meaning; a kicker is a crutch this system doesn't use.

## Layout

A single centered column, `max-width: 78rem`, `padding-inline: 1.5rem` — shared by the header, hero, every section, and the footer, so the left/right edges line up exactly down the whole page.

The hero is the one asymmetric moment: a two-column grid (`minmax(0,1fr) 22rem`, gap 3rem) appears only from `64rem` up, pairing the text block with a portrait (3:4) photo panel. Below `64rem` the photo column is not just hidden — its `background-image` rule sits entirely inside the `64rem` media query, so narrower viewports never fetch the asset.

Section rhythm: `padding-block: 5.5rem` per section, separated by a hairline top border, alternating Paper Cream / Warm Husk backgrounds instead of cards. Content grids (two "signal" columns, four "step" columns) go single-column below `48rem` and expand at `48rem`.

Spacing anchors actually reused across the page: `0.75rem` (tight inline gaps — button pairs, header row), `1.5rem` (nav item gaps, footer row gap), `3rem` (hero grid gap, signal-card grid gap), `5.5rem` (vertical rhythm between sections). Hero-specific padding (`7rem` top / `8rem` bottom) is a one-off for that single moment, not a scale step.

## Elevation & Depth

Flat. Zero `box-shadow` anywhere in the system. Depth and separation come from exactly two devices: a 1px Ink Hairline border, or a shift between Paper Cream and Warm Husk. Interactive elements communicate state through color change alone (fill darkens on hover, border darkens on hover) — never through a shadow or lift.

### Named Rules
**The Flat Ledger Rule.** No surface ever lifts, glows, or casts a shadow. If two things need visual separation, draw a hairline between them or change the paper tone — do not add depth.

## Shapes

Square by default. The only rounded corners in the entire system are the buttons (3px — barely-there, enough to soften a click target, not enough to read as "rounded") and the brand mark (a full circle, `border-radius: 9999px`). Cards, panels, the photo frame, section dividers: all hard corners, all bordered with the same 1px Ink Hairline rather than clipped or shadowed.

## Components

### Buttons
- **Shape:** 3px corner radius (`rounded.sm`) on every button, no exceptions.
- **Primary** (`button-primary`): Field Green fill, white text, 700 weight, `0.72rem 1.4rem` padding. The only solid-fill element in the system besides the accent underline on labels.
- **Hover:** fill steps to Field Green Deep. No transform, no shadow — a 0.15s color transition only.
- **Secondary** (`button-secondary`, "vazado"): transparent fill, 1px Ink Hairline border, Deep Ink Green text. Hover darkens the border to Deep Ink Green — never fills the background.
- **Focus:** every button and link gets a 2px Field Green outline, 3px offset, rounded to match the control — themed, not the browser default.

### Navigation
- Logo mark: a small gradient circle (`#4a9354 → #2d6a3f → #5b4326`, one-off, not a system token) beside the wordmark, 700 weight, tight tracking (-0.01em).
- Primary nav is two items: a text link (Label typography, Field Green, no underline) and a primary button. Below `26rem` the text link is dropped entirely rather than wrapped — the same destination is always still reachable from the button pair in the hero.
- The header row wraps (`flex-wrap: wrap`) rather than compressing its children, so it degrades gracefully under text-zoom instead of breaking a button's label across lines.

### Photo Panel (signature component)
A single real aerial photograph, always cropped to 3:4, framed only by a 1px Ink Hairline border — no rounding, no shadow, no caption. It exists only at `64rem`+ and its source lives entirely inside that breakpoint's media query so it costs nothing below it. Purpose: make the abstract line-grid motif behind the hero literal, without ever competing with it for attention (they occupy different halves of the hero, once the layout has room for both).

## Do's and Don'ts

### Do:
- **Do** keep Paper Cream as a fixed, light-only background on this surface — it is a deliberate brand decision (see PRODUCT.md), not an oversight that it ignores system dark mode.
- **Do** derive every border/divider from Deep Ink Green at low opacity (`rgba(27, 42, 26, 0.14)`), never an unrelated gray.
- **Do** gate any large decorative asset (photo, illustration) behind the media query at the breakpoint where it appears, so narrower viewports never fetch it.
- **Do** balance display and headline text (`text-wrap: balance`) and cap their measure (~15ch / ~24ch) so they never run past two or three confident lines.
- **Do** theme focus rings, text selection, and hover states from the palette (Field Green) — never leave a browser default unstyled.

### Don't:
- **Don't** add a shadow, glow, or lift to any surface. Depth is a hairline or a paper-tone shift, always.
- **Don't** put a small-caps label above a heading. The heading carries its own weight.
- **Don't** introduce a second accent hue. If Field Green feels insufficient, the fix is weight, size, or a hairline.
- **Don't** round a corner past 3px, except the circular brand mark.
- **Don't** let a button's label wrap — fix the width or drop a sibling element before letting text break inside a control.
