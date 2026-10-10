# Zeenat landing page

Public marketing website for https://zeenat.app. Dependency-free static HTML generation with Node 24, using the mobile app's plum/cream/gold palette, self-hosted Plus Jakarta Sans and existing brand assets. HTML contains the complete content without client JavaScript.

## Preview locally

```bash
cd /Users/ahmed/zeenat/zeenat-landing
nvm use
npm ci
npm run dev
```

Open http://127.0.0.1:4321. The server builds once at startup; restart after source changes. `PORT=4322 npm run dev` selects another port.

```bash
npm run build
npm run check
```

`src/index.html` and `src/styles.css` control presentation. `scripts/build.mjs` renders SVG icons, store links, metadata, schema, robots.txt, sitemap.xml and a 404 page. `site.config.json` controls the canonical origin and optional HTTPS App Store / Google Play links. Empty links show honest coming-soon labels. No mailing list or signup form is wired to a backend.

## Launch

Follow [LAUNCH.md](LAUNCH.md) in order. Hosting matches the admin frontend: CircleCI → SSH → Oracle → Nginx, with isolated versioned releases and an atomic `current` symlink. This project uses `/var/www/zeenat-landing` and does not reuse the admin deployment directory. No OpenAI Sites hosting is needed for the requested Oracle deployment.

## Assets

The logo and favicon use the approved pink face-and-feather app branding from `zeenat-mobile-app/assets/app-icons`. Self-hosted font licensing is in `public/assets/FONT-LICENSE.txt`. Screenshot cards are optimised JPEG derivatives of `output/app-store-final`, which contains AI-composited marketing artwork with existing demo data, not pixel-identical app screenshots. The hero uses an original simulator capture. All previews are labelled accordingly. The social sharing card is a local graphic built from the app capture. No remote font/image calls or tracking scripts are needed.

## SEO now and later

The page includes a descriptive title, description, absolute canonical URL, Open Graph/Twitter metadata with a 1200×630 JPEG, Organization/WebSite/WebPage JSON-LD, crawlable navigation, descriptive image alt text, robots.txt and a sitemap. Nginx returns real 404 responses instead of a SPA fallback. Unknown URLs are not indexed as copies of the homepage. The sitemap deliberately omits a fabricated last-modified date. No invented ratings, listings or claims are in structured data.

When public APIs arrive, add real crawlable HTML pages for businesses, services and marketplace listings, with stable URLs, unique titles/descriptions, canonical links and appropriate factual schema. The static builder can fetch approved public data at build time; trigger builds on updates. If freshness requires request-time rendering, introduce a server rendering layer and adapt deployment then. Do not rely on client-only API fetches for primary SEO content. Keep private measurements, requests and contact details out of public pages. Add detail URLs to the sitemap and link them from category/city pages only when there is real useful content. See [Google's developer SEO guide](https://developers.google.com/search/docs/fundamentals/get-started-developers) and [sitemap guide](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Verification scope

`npm run check` verifies internal asset paths, section anchors, unique IDs, the main heading, canonical markup, structured-data JSON and generated crawl files. Local HTTP checks confirmed homepage 200, missing-page 404, robots.txt and sitemap responses. Shell and Node syntax checks passed. Browser visual QA and remote Nginx/TLS execution were not available in this session; review desktop and mobile before launch. The scripts and configuration are prepared locally; this does not mean the Oracle site, remote Git repository or CircleCI project has been created.
