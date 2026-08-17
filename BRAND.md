# AlgoKabs — design system

**Position:** Systems Engineering & Trading Automation
**Register:** the engineer, not the signals guy. Restraint reads as competence.

## Palette

Warm charcoal ground, cream type, gold used *rarely*. Gold appears on the mark,
the primary action, and active state — almost nowhere else. That discipline is
what makes it read as expensive rather than loud.

| Token | Hex | Use | Contrast on bg |
|---|---|---|---|
| `--bg` | `#14130F` | page ground | — |
| `--surface` | `#1C1A15` | cards | — |
| `--surface-2` | `#24211B` | inputs, insets | — |
| `--border` | `#2E2A22` | hairlines | — |
| `--fg` | `#F0EAD9` | primary text | 15.5 |
| `--muted` | `#A29B8C` | secondary text | 6.7 |
| `--muted-dim` | `#8B8578` | quietest copy | 5.1 |
| `--gold` | `#C9A227` | brand, CTA, active | 7.7 |
| `--sage` | `#7D8471` | structure, secondary, trace | 4.8 |
| `--live` | `#93A96B` | delivered, confirmed | 7.2 |
| `--warn` | `#C2913F` | pending, testing | 6.6 |
| `--danger` | `#C4736A` | complaints, rejected | 5.3 |

Every value clears WCAG AA (4.5:1). Verified in-browser, not estimated — a lot
of the audience reads this on a phone in daylight.

## Type

- **Display** — Instrument Serif, 400. All `h1`–`h3`. The one clear signal that
  this isn't another neon fintech template.
- **Body / UI** — Geist Sans.
- **Data, labels, eyebrows** — Geist Mono, uppercase, `0.18em` tracking. Use the
  `eyebrow` utility.
- **Wordmark** — Josefin Sans Light, wide tracking. Closest free match to the
  original deco letterforms.

## The mark

`src/components/logo.tsx`. Text + inline SVG, never a raster asset — it stays
crisp, inherits the palette, and can animate.

The circuit trace is the good idea in the original logo: a path that reads as
both a circuit and a price line. It gets the motion; the wordmark stays still.

- `<Logo size="lg" />` — hero. Trace draws itself over 1.6s, nodes pop in after.
- `<LogoMark textFrom="sm" />` — headers. Icon only below `sm` so the nav
  doesn't wrap to two rows on a 375px phone.

## Motion

Confident but restrained. Nothing loops except one soft pulse on live status.

| Element | Motion |
|---|---|
| Logo trace | `stroke-dashoffset` draw, 1.6s, once on load |
| Trace nodes | scale + fade, staggered after the draw |
| Sections | `Reveal` — 16px rise + fade, `once: true` |
| Admin stats | `CountUp` — motion value, no per-frame React state |
| `in_dev` badge | 2.4s opacity pulse |
| Cards | 0.5px lift + border warm on hover |

All of it collapses under `prefers-reduced-motion`, including the trace, which
renders fully drawn rather than invisible.

## Rules

1. **Gold is rationed.** Primary button, active nav, the mark, prices. If gold
   is on screen three times, one of them is wrong.
2. **Sage carries structure** — secondary notices, the trace, list markers,
   inactive icons. It's the workhorse; gold is the accent.
3. **Serif for headings, mono for data.** Never mono for body copy.
4. **No neon glows.** One warm pool of light behind the hero, and `lift` for
   card depth. That's the whole lighting model.
5. **Semantic colours are desaturated** to sit on the warm ground. Never drop a
   stock Tailwind `red-500` in — use `--danger`.
