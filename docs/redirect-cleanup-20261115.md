# Redirect cleanup — 2026-11-15

Production baseline: 24abdd60a1ad0d81183849fafd273dd5fe414ba8.

- Replaced 961 internal URL references with their clean destinations across 114 HTML pages, and updated the travel generator. External references and query/fragment attribution are preserved.
- Promoted four existing cn/en cosmetics-brand/local-tourism meta-refresh migrations to server-side permanent redirects. The destinations are unchanged; actual translated content pages remain distinct.
- Kept HTTPS, non-www, cleanUrls and trailingSlash=false normalization. The 25 Search Console examples are regression fixtures in scripts/redirect-examples.json.
- Three combined legacy variants (HTTP + www; www + index.html; www + company.html) require two platform redirects. Other examples require one. Domain-level security/canonical redirects are intentionally retained; internal links no longer point at these variants.
- Sitemap contains only clean preferred URLs; no sitemap changes were needed.

Checks: `python3 scripts/normalize-internal-links.py --check`, `node scripts/check-redirects.js --live`, `node scripts/check-canonical-urls.js`, `npm run check:site`.

“Page with redirect” is expected for legacy aliases. It does not mean the destination page failed indexing. Historical Search Console rows can remain after recrawling.
