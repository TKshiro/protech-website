# Canonical URL policy

Updated: 2026-11-15

- Public pages use `https://pro-tech.jp`, extensionless paths, no trailing slash (except the root), and one absolute self-referencing canonical.
- Language versions remain separate canonical pages. Never canonicalize translated travel pages to another language.
- Inquiry metadata uses fragments: `/contact#inquiry?service=kol`, `/travel/ja#inquiry?source=onsen-ryokan-booking`. The fragment is not sent in the HTTP request. Shared JavaScript restores the form anchor and reads only supported context fields.
- Existing query links remain accessible and canonicalize to their clean page. Do not block these URLs in robots.txt or add noindex merely to manage canonical selection.
- Contact inquiry context is included in the message sent to the existing email and inquiry storage handlers. Travel attribution accepts both the new fragments and old query links.
- Sitemap entries and canonical/og:url metadata must never contain inquiry parameters or fragments.
- Removed obsolete, nonfunctional SearchAction markup from the three homepages. Retain WebSite structured data.
- Generate travel guides with the updated generator, which uses fragment context.

Run `node scripts/check-canonical-urls.js` and `node scripts/check-canonical-urls.js --live` to verify the 14 reported examples. Run `npm run check:site` for the existing general site checks.

Search Console's “Alternate page with proper canonical tag” is expected for old query variants. This change reduces new variants; it does not guarantee that historical report rows disappear or that Google indexes every canonical page. Inspect the clean URLs in Search Console to check Google's selected canonical and index status after recrawling.
