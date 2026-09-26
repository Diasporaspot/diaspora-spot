# Event capacity and waiting lists

Staging demos: `/workshops/capacity-demo-free/register` and `/workshops/capacity-demo-paid/register`.
Staging admin: `/studio` (existing Sanity editor/administrator login required).

Set **Maximum attendees** on a workshop or series. Blank means unlimited; zero means waiting list immediately. Booking status can force waiting list or closed. Series purchases reserve their own allocation and a place in every included workshop atomically. The former allowWaitlistedWorkshops field does not bypass capacity.

The overview refreshes every 15 seconds. Counts are calculated from the private Supabase event ledger; staging and production records are partitioned by environment. A checkout holds its place for about 31 minutes. The server verifies Stripe expiry before returning seats, including when a webhook is missed. Completed payments can be recovered during availability reconciliation. Email sync failures remain visible and can be retried in the overview.

Waiting-list groups are created on first join or with **Create waitlist email group** in the overview. In MailerLite, configure a **Joins a group** automation for that exact group. Email content and activation remain MailerLite tasks; creating a group alone does not send an email. New-space announcements are manual campaigns. A confirmed booking removes the person from relevant workshop waitlist groups.

Staging groups begin with `STAGING`. Only EVENT_STAGING_EMAIL_ALLOWLIST addresses are sent to MailerLite. Other test entries display `staging skipped`. Stripe uses test keys. The embedded Studio route is unavailable in production.

## Deployment

Apply both 20260925 migrations. Set EVENT_CAPACITY_ENABLED=true, EVENT_SUPABASE_SERVICE_ROLE_KEY to a modern secret key, and optionally EVENT_SUPABASE_URL to a separate project. Keep the key server-only. Configure EVENT_ADMIN_ORIGINS for a separately hosted Studio. An embedded Studio also needs its website origin in Sanity's credentialed CORS allowlist.

Stripe webhook subscriptions must include checkout.session.completed, checkout.session.expired, checkout.session.async_payment_succeeded, and checkout.session.async_payment_failed. The existing endpoint is /api/stripe/webhook.

Before enabling production, import existing confirmed attendees and reconcile any open Stripe checkouts. Do not turn on capacity for existing sold events with an empty ledger. Refunds/cancellations require an operational process; they do not automatically cancel confirmed registrations in this version.

## Verification

`npm test`, `npm run lint`, `npm run build`.

`node --env-file=.env --env-file=.env.local --import tsx scripts/event-capacity-staging-test.ts` tests the real database: 20 concurrent buyers for one seat, duplicate booking and waitlist requests, all-or-nothing series allocation, webhook replay, environment isolation, counts, and anonymous-access denial. It removes only records it creates.
