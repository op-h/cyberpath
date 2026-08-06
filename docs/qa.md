# CYBERPATH — QA & release (SENTRY)

## Automated

A headless jsdom suite drives the full wizard. Latest run: **15 checks + a 252-combination
sweep, 0 failures**, no console errors. It verifies: Enter on an early step advances (never
generates a half-plan); no malformed totals (no "1–0 months"); no empty resource lists; no
`undefined` leaks; hobby appetite shows no cert badges; the offensive *entry* ladder excludes
OSCP (now `advanced`); the share-link hash round-trips (generate → reload restores the plan);
"Edit answers" reopens the wizard preserving answers; the cost estimate shows for paid and
hides for free budgets; and restart clears the hash and inputs. (Tests run from an isolated
scratchpad; re-create with jsdom.)

`node --check` passes on both JS files.

## Browser matrix

| Feature used | Chromium | Firefox | Safari/WebKit | Notes |
|---|---|---|---|---|
| `@layer`, `:has()`, `color-mix`, logical props, `100svh`, `accent-color` | ✓ | ✓ | ✓ | all Baseline |
| `color-mix` hover glow / terminal bloom | ✓ | ✓ | ✓ | degrades to transparent on pre-2023 WebKit (cosmetic) |
| Print → PDF | ✓ | ✓ | ✓ | verify page breaks + cert URL expansion |

No `<dialog>`, `backdrop-filter`, or implicit global `event`. External links use `rel=noopener`.
No inline `on*` handlers. Meta-CSP present (`script-src 'self'`, `style-src` allows inline for
runtime `style=""`). No secrets/tokens in client code.

## Manual checklist (needs a real browser)

1. **JS off:** hero + "browse the tracks" noscript grid render all six tracks/certs; toggling
   the OS to light theme flips the page (fixed by removing the hardcoded `data-theme`).
2. **Keyboard only:** Tab header → Start → each step (arrows within a radio group) → Generate →
   Print/Restart. Focus ring visible in **both** themes; focus lands on the plan `<h1>` after
   Generate and on Start after Restart; no trap.
3. **P1 regression:** budget=Free + track=Cloud/AppSec/DFIR + goal=first-job — the certification
   phase shows a "prepare then book the exam" note, **never** an empty list.
4. **Print:** `Ctrl+P` on a generated plan → clean document; no phase/section is split across
   two pages (`break-inside: avoid` on phases, blocks, summary, ladder; `break-after: avoid` on
   headings); a faint diagonal **CYBERPATH · tryhackme.com/p/oph watermark** repeats on every
   page; cert links show their URL. `Ctrl+P` on the landing page no longer prints blank.
   (Chrome/Firefox/Safari repeat `position: fixed` per page — verify the watermark on page 2+.)
5. **Reflow:** 320 → 2560px and 200% zoom — no horizontal scroll, no clipped headings; the
   terminal scrolls internally.
6. **Console:** zero errors/warnings on load, through the wizard, and on print.
7. **Reduced motion:** no step/phase animation; instant scroll.

## Known follow-ups

- Deployer must set the real origin (see seo.md) before search submission.
- `noscript` static mirror is hand-maintained — diff it against `data.js` on any track change.
