# CYBERPATH — Cybersecurity Learning Roadmap Builder

A single-page, dependency-free web app that asks a learner a short series of questions and
generates a **personalised, downloadable cybersecurity roadmap** — phases, realistic
timeframes, a certification ladder and free-or-paid resources.

Design inspired by **Hack The Box**, **TryHackMe** and **INE**: a refined dark, terminal-tinged
interface with clear, academy-style structure.

## What it does

The learner answers up to **eight questions**:

| Variable | Effect on the plan |
|---|---|
| **Track / goal** | Chooses one of six paths (Offensive, Blue Team, GRC, Cloud, AppSec, DFIR) — or an "explore" route if unsure. |
| **Experience level** | Scales every phase's duration and drops foundations a pro doesn't need. |
| **Existing background** | Skips foundation phases you already know (networking, Linux, programming, sysadmin). |
| **Weekly hours** | Scales all timeframes to a pace you can actually sustain. |
| **Target deadline** | Sanity-checks the plan and tells you the hours/week you'd truly need. |
| **Budget** | Free-only shows a no-cost path; mixed/paid surface premium labs and certs. |
| **Learning style** | Tailors study advice and which resources lead (labs vs. courses vs. reading). |
| **Depth goal** | Hobby stops at skills; entry adds a core cert; advanced extends to expert certs. |

The output is a phase-by-phase timeline with per-phase durations, skills, resources and
target certifications, plus a numbered **certification ladder**, a rough **exam-fee estimate**,
a **total study-time** figure and a deadline reality-check. Actions on the plan:

- **Download as PDF** — a dedicated print stylesheet, no libraries, works in every browser.
- **Copy link** — encodes your answers in the URL so the exact plan is bookmarkable/shareable;
  opening that link restores the plan directly.
- **Edit answers** — reopens the questionnaire with your answers preserved so you can tweak.
- **Start over** — clears everything and returns to the start.

## Run locally

It's fully static. Any static server works:

```bash
cd cyberpath
python3 -m http.server 8080
# open http://localhost:8080
```

(Opening `index.html` directly via `file://` also works.)

## Deploy to GitHub Pages

1. Push this folder to a repository (either as the repo root, or keep the `cyberpath/`
   folder and set Pages to serve from it).
2. In **Settings → Pages**, set **Source = Deploy from a branch**, pick your branch and the
   folder (`/root` or `/cyberpath`).
3. Wait for the green check; your site is at `https://<user>.github.io/<repo>/`.

No build step, no Node, no secrets. If you serve from a subfolder, all asset paths are
already relative so nothing needs changing.

> **Tip:** update the `<link rel="canonical">` and `og:url` in `index.html` to your real URL.

## Project structure

```
cyberpath/
├── index.html                 # markup + no-JS static reference
├── assets/
│   ├── css/styles.css          # cascade-layered CSS, dark/light themes, print styles
│   └── js/
│       ├── data.js             # the roadmap content model (tracks, phases, certs)
│       └── app.js              # wizard controller + roadmap engine + renderer
└── docs/
    └── decisions/0001-planner-is-app-shell.md
```

## Editing the content

All roadmap content lives in **`assets/js/data.js`** — add a track, a phase, or a
certification there and the UI updates automatically. Certification costs are graded by
**tier** (Free / $ / $$ / $$$) rather than exact figures, because prices change; verify
current fees on each provider before paying.

## Accessibility & standards

Built to the Atelier Definition of Done: keyboard-operable, WCAG 2.2 AA contrast,
no horizontal scroll 320–2560px, `prefers-reduced-motion` and `prefers-color-scheme`
respected, zero console errors, no third-party dependencies or trackers.
