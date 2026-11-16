# Admin contacts and newsletter upgrade

Status: implemented locally and tested with fixtures; not deployed. No live inquiry data has been deleted and no mail has been sent.

## Implemented

- Inquiry status actions await a successful API response before updating the UI. Server GET excludes deleted rows. Cleanup only clears rows already marked 削除済み, and archives valid email addresses first.
- Authenticated independent address directory in the existing spreadsheet's NewsletterContacts tab. Addresses are normalized/deduplicated; invalid email strings and travel handles are excluded. Imports do not override opt-outs or enroll users automatically.
- Explicit consent evidence required when changing to subscribed. CSV export includes only consented subscribers.
- NewsletterDrafts tab stores plain-text drafts. Admin supports editing, preview, saved drafts and text export. Manual delivery is implemented through a Gmail SMTP adapter (with optional Resend support). The sender freezes draft content and consenting recipients, asks for confirmation, processes two recipients per request, records provider acceptance, and uses stable idempotency keys. Uncertain results older than 23 hours are blocked from automatic resend. Acceptance is not labelled delivery.
- New API requires ADMIN_PASSWORD, SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT. The old server-side default password fallback has been removed; verify ADMIN_PASSWORD is configured before deploying. All new spreadsheet writes use RAW.

## Verification

`node --test tests/admin-newsletter.test.js tests/contact-deletion.test.js` — 18 tests pass (also include tests/newsletter-delivery.test.js).
`npm run check:site` — passes.
Local fixture UI tested at http://127.0.0.1:8876/admin: directory import, non-subscribed status, draft save and preview. Preview uses synthetic example.com data only. Local mock server is /tmp/protech-admin-preview.cjs.

## Confirmed scope and release prerequisites

The user confirmed that deleted items mean backend inquiry records and approved directory + drafts + preview + manual sending. No live records have yet been cleared.

Vercel environment metadata currently lists only SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT. ADMIN_PASSWORD is not configured. Deploying the new fail-closed auth before setting it would lock out the admin. Do not retain the publicly known source-code fallback password.

Required before production release:
- ADMIN_PASSWORD (production and preview as appropriate), supplied by the owner through Vercel; never paste credentials into chat.
- Provider confirmed: Gmail. Configure GMAIL_USER and GMAIL_APP_PASSWORD in Vercel production/preview. Gmail app passwords require two-step verification and may be unavailable for some managed accounts; use OAuth if prohibited. Do not use the normal login password. Gmail sender is fixed to GMAIL_USER.
- NEWSLETTER_SIGNING_SECRET: stable cryptographically random 32+ character secret. Do not rotate casually: existing unsubscribe links must remain valid.
- NEWSLETTER_POSTAL_ADDRESS: sender postal address included in every message.

After deployment, log in through the normal admin flow, import contacts, and run the already-authorized cleanup of records marked 削除済み. Record counts only, not customer addresses, in release notes. New inquiry addresses are not subscribed automatically. Do not actually send a newsletter without a specific approved draft and recipient list.

Unsubscribe endpoint accepts GET for confirmation only and POST to record opt-out. A separate suppression table protects opt-outs against contact re-import and stale subscriber data. Explicit later consent can re-enroll a subscriber. Sending records retain the exact payload for safe retries.

Latest known production baseline: e06f19092bb9e8711f1797774b2ae537df2d73cf. Existing unrelated uncommitted SEO changes in the main workspace must not be included in deployment.

## Gmail update

NEWSLETTER_PROVIDER=gmail, NEWSLETTER_POSTAL_ADDRESS (from the published company page), and a fresh stable NEWSLETTER_SIGNING_SECRET were configured in Vercel. ADMIN_PASSWORD, GMAIL_USER, GMAIL_APP_PASSWORD still require owner input.

Gmail has no Resend-style idempotency key. Each recipient acquires a uniquely named hidden Sheets lock tab atomically before submission, rereads the delivery journal, and removes its own lock only after acceptance is recorded (or the recipient is skipped). Ambiguous SMTP outcomes retain the lock and block automatic retry. This avoids concurrent duplicate submission; manual provider investigation is needed after an uncertain result. Accepted means SMTP acceptance, not inbox delivery. No live SMTP connection or actual email was attempted during testing.
