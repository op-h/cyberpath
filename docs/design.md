# CYBERPATH — design system (MUSE)

**Concept:** "Refined dark academy." Hack The Box energy (near-black canvas, neon-green
accent, terminal motif) with INE structure (cards, clear hierarchy, calm spacing).

## Tokens (see `assets/css/styles.css` `@layer tokens`)

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0d1117` | `#f6f8fa` | page canvas |
| `--surface` / `--surface-2/3` | `#161b22` … | `#fff` … | cards, insets |
| `--text` | `#e6edf3` | `#10161d` | body copy |
| `--muted` | `#9aa7b4` | `#56616c` | secondary text (≥5:1) |
| `--faint` | `#8b97a4` | `#5a636f` | labels/meta (AA-verified ≥5:1) |
| `--accent` | `#9fef00` | `#3f7d00` | primary/brand (green) |
| `--accent-2` | `#58a6ff` | `#0b62d6` | links, secondary accent (blue) |
| `--warn` / `--ok` | amber / green | darkened | deadline verdicts, tiers |

Cost-tier colors: free=green, `$`=blue, `$$`=amber, `$$$`=red — mirrored in both themes
with darkened light-mode values for contrast.

**Type:** system-ui sans for body; a monospace stack (`ui-monospace, "Cascadia Code",
"JetBrains Mono"…`) for the eyebrow, stats, chips, phase durations and terminal — HTB
character with **zero web-font fetch** (no CLS, no request).

**Scale:** fluid `clamp()` steps `--step--1 … --step-4`. **Spacing:** `--sp-1 … --sp-7`;
one `--section-space` drives vertical rhythm across hero/wizard/result/static.

**Signature elements:** the hero terminal card (with a soft accent bloom), and the plan
**timeline** — a gradient spine with tier-colored nodes so the roadmap reads as a path,
not a stack of cards.

**Motion:** short `fade-up` on step change and phase reveal, opacity/transform only, fully
gated behind `prefers-reduced-motion`.
