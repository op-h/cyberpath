# CYBERPATH — performance budget (QUARTZ)

Static, dependency-free, system fonts, no images (inline SVG favicon only).

## Measured weight

| Asset | Requests | Raw | Gzip |
|---|---|---|---|
| index.html | 1 | ~13 KB | ~4 KB |
| styles.css | 1 | ~22 KB | ~5.5 KB |
| app.js | 1 | ~26 KB | ~8.5 KB |
| data.js | 1 | ~37 KB | ~10 KB |
| fonts / images | 0 | 0 | 0 |
| **Total** | **4** | **~98 KB** | **~28 KB** |

## Budget gates (all PASS)

| Metric | Budget | Now |
|---|---|---|
| Total transfer | ≤ 60 KB gz | ~28 KB |
| JS | ≤ 20 KB gz | ~18.5 KB |
| CSS | ≤ 8 KB gz | ~5.5 KB |
| Requests | ≤ 6 | 4 |
| Web fonts | 0 | 0 |

## Core Web Vitals posture

- **LCP:** hero `<h1>` is system-font text — no web font, no LCP image, no swap reflow.
- **CLS:** wizard/result are `hidden` and swapped on user click (>500ms after load, excluded).
  The static grid is enhanced from the same data; a defensive change here would be to
  pre-render its cards. Currently below the fold; not scored in practice.
- **INP:** scripts `defer`ed (main thread free early); step animation restarts via double-rAF
  (no forced sync layout); `background-attachment: fixed` dropped on touch devices.

## Watch list

- `data.js` (~10 KB gz) is the heaviest asset; it feeds the visible browse grid so it loads
  eagerly. First candidate to lazy-load if the JS budget ever tightens.
- If an OG image is added (see seo.md), keep it < 300 KB; it is not render-blocking.
