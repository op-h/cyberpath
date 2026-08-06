# CYBERPATH — SEO & metadata (BEACON)

Single-page tool. Metadata lives in `index.html`.

## Deployer action — set the real origin (REQUIRED)

Placeholders read `https://op-h.github.io/cyberpath/`. Replace **all** of these
with your real Pages URL (or custom domain) so they stay in sync:

- `<link rel="canonical">` and `<meta property="og:url">` — `index.html`
- JSON-LD `"url"` — `index.html`
- `Sitemap:` line — `robots.txt`
- `<loc>` — `sitemap.xml`

## Present

- Title (51 chars), meta description (~180 chars, front-loaded), `lang="en"`.
- Open Graph + Twitter `summary` card; `og:site_name`, `og:locale`.
- `theme-color` per color scheme.
- JSON-LD `WebApplication` with `isAccessibleForFree: true`, `featureList`, `offers` (price 0).
- `robots.txt` + `sitemap.xml`.

## Deliberately omitted

- **`og:image`** — needs a real 1200×630 asset committed at `assets/og/` and referenced by
  **absolute** URL. Not fabricated. `TODO(content): produce OG artwork`, then switch
  `twitter:card` to `summary_large_image`.
- **FAQ / BreadcrumbList JSON-LD** — no Q&A content and no nav hierarchy exist; adding them
  would mean inventing content. `WebApplication` is correct and sufficient.

## Analytics

The footer publicly promises "no tracking." Honor it: ship **no** client analytics (rely on
host request logs), or only a cookieless, PII-free counter. No key or token in client code.
