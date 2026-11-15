# Reported 404 recovery — 2026-11-15

Baseline: 5e265fffd53c6c96ae8e3f457445d61944b89eef.

13 route mappings recover 14 reported URLs (the retired SNS article appears in two host/path variants). Canonical destinations remain in the sitemap; aliases do not.

- Eight unavailable cn/en resource, pricing, FAQ, legal and inbound-report paths lead to their existing shared Japanese pages. This is a fallback to available content, not a claim that translated pages were created. Existing translations remain untouched.
- Dianping registration goes to the Dianping service page, which describes registration and certification support.
- China SNS agency goes to the services overview; Xiaohongshu agency cost goes to the existing pricing page with RED monthly plans.
- The media-kit resource alias goes to the existing resource download center.
- The retired inbound-sns-strategy-2026 article follows its previously recorded replacement, china-sns-inbound-guide. The old Netlify _redirects file was not executed by Vercel; the rule is now in vercel.json.

/news-detail without an article identifier has no verified replacement; /cdn-cgi/l/email-protection is a Cloudflare utility endpoint, not an indexable content page. Both keep a real 404. Do not redirect all unknown paths to the homepage. Existing email-protection behavior is preserved.

Checks: scripts/check-not-found-recovery.js (--live for 16 reported URL outcomes and query preservation), check-redirects.js, check-canonical-urls.js, check-site.js.
