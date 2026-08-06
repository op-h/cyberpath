# ADR 0001 — The roadmap planner is an app shell (with a static fallback)

- Status: Accepted
- Date: 2026-08-05
- Decider: ATLAS

## Context

The Definition of Done requires content and primary navigation to work with JavaScript
disabled, *unless* ATLAS records an ADR declaring the project an app shell.

CYBERPATH's core feature is a client-side planner: it reads six-to-eight answers and
computes a personalised, scaled roadmap. There is no server (GitHub Pages is static
hosting), so the generation step cannot be performed without JavaScript.

## Decision

The **interactive planner** is declared an app shell. It requires JavaScript.

To keep content accessible without JS, the page ships a **static reference** section
(`#tracks-static`) that lists all six tracks, their phases and certification ladders in
plain HTML inside `<noscript>`. With JS enabled, the same region is re-rendered from the
shared data model as a "browse the tracks" grid.

## Consequences

- A user with JS disabled still gets the full substantive content (tracks, paths, certs,
  free resources) — only the *personalisation and PDF export* are unavailable.
- The data model lives in one place (`assets/js/data.js`); the `<noscript>` block is a
  hand-maintained condensed mirror. If tracks change materially, update both.
- No framework is introduced; the shell is ~one vanilla JS file. No app-shell tax on the
  perf budget.
