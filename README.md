This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Create a local `.env` file with the public Sanity values and the server-only MailerLite values:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=beibii8a
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-06-02
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
MAILERLITE_API_KEY=your_mailerlite_api_key
MAILERLITE_GROUP_ID=optional_existing_group_id
MAILERLITE_MEMBERS_GROUP_ID=members_group_id
MAILERLITE_MEMBER_MARKETING_GROUP_ID=optional_marketing_consent_group_id
MAILERLITE_SMS_MARKETING_GROUP_ID=sms_marketing_opt_ins_group_id
MAILERLITE_SYNC_SECRET=random_server_only_secret
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_WEBHOOK_SECRET=whsec_webhook_signing_secret
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

`MAILERLITE_GROUP_ID` is optional. When present, early-access submissions are added to that existing MailerLite group.
`NEXT_PUBLIC_SITE_URL` is used for Stripe Checkout success and cancel redirects in deployed environments.

## Membership workflow

Supabase owns authentication, profiles and membership status. Members request a passwordless email
link. The first successful authentication creates an active `free`
membership registration and a durable MailerLite sync job.

Free registration and paid benefits are intentionally separate. A free account is stored in
`memberships`; current or future provider-backed subscriptions are stored in
`membership_subscriptions`. Access checks for discounts and members-only events must use
`has_active_membership_subscription()`, not the free-registration `is_active_member()` check. The
subscription table is ready for a future Stripe webhook, but checkout and recurring billing are not
part of this milestone.

MailerLite uses two deliberately separate groups:

- `MAILERLITE_MEMBERS_GROUP_ID` contains every member for essential membership communications.
- `MAILERLITE_MEMBER_MARKETING_GROUP_ID` contains only members who opted into news, offers and
  event marketing. It is optional, but recommended.

The `sync-mailerlite-members` Edge Function upserts subscribers without setting their MailerLite
status. This is intentional: an address that unsubscribed must never be silently reactivated.
Failed syncs remain in `mailerlite_member_syncs` and use exponential retry scheduling.

The hosted project uses Supabase's modern publishable and secret API keys. Legacy JWT-based `anon`
and `service_role` keys are disabled. The Edge Function reads `SUPABASE_PUBLISHABLE_KEYS` and
`SUPABASE_SECRET_KEYS`, with legacy environment-variable fallbacks only for local Supabase versions
that have not yet adopted the new key format.

### Local Supabase

The project-local CLI is pinned as a development dependency. Docker or another compatible container
runtime is required for the local stack.

```bash
npx supabase start
npx supabase db reset
npx supabase functions serve sync-mailerlite-members --env-file supabase/.env.local
```

Create the ignored `supabase/.env.local` file with:

```bash
MAILERLITE_API_KEY=...
MAILERLITE_MEMBERS_GROUP_ID=...
MAILERLITE_MEMBER_MARKETING_GROUP_ID=...
MAILERLITE_SMS_MARKETING_GROUP_ID=...
MAILERLITE_SYNC_SECRET=...
```

### Hosted deployment

1. Authenticate and link the CLI with `npx supabase login` and
   `npx supabase link --project-ref <project-ref>`.
2. Preview migrations with `npx supabase db push --dry-run`, then run `npx supabase db push`.
3. Set Edge Function secrets with `npx supabase secrets set --env-file supabase/.env.production`.
4. Deploy with `npx supabase functions deploy sync-mailerlite-members --no-verify-jwt`.
5. Add both the production `/auth/confirm` URL and local development URL to Supabase's redirect
   allow list. Keep the production domain as the Site URL.
6. The callback supports Supabase's default PKCE magic-link email. When custom SMTP is configured,
   update the hosted Magic Link email template to use the version-controlled token-hash template in
   `supabase/templates/magic-link.html`. Supabase does not allow hosted email-template changes on a
   Free project that still uses its default email provider.

The Edge Function accepts either a signed-in member access token (to sync that member) or the
server-only `MAILERLITE_SYNC_SECRET` in the `x-mailerlite-sync-secret` header (to reconcile a batch).
Schedule the batch invocation after the hosted project and deployment environment are confirmed.

Member profiles store normalized international phone numbers in Supabase. MailerLite receives the
same number through its standard `phone` field. SMS marketing has a separate preference and consent
history from email marketing, and only opted-in members join `MAILERLITE_SMS_MARKETING_GROUP_ID`.

## Workshop registration workflow

Published workshops automatically receive a dedicated MailerLite group through the deployed `provision-workshop-mailerlite` Sanity Function. The function stores the generated group ID on the workshop and registration becomes available when setup is complete.

Published workshop series receive their own group through `provision-series-mailerlite`. A series
registration adds the attendee to the series group and every included workshop group. Series pricing
is independent of individual workshop pricing, so a series may be free or paid while every included
workshop remains individually bookable.

The function has its own server-side `MAILERLITE_API_KEY`, configured with the Sanity Functions environment-variable command. It does not require a webhook, callback URL, webhook secret, or manually managed Sanity write token.

Staff can find the generated group in MailerLite using the workshop title and date. They may optionally activate a MailerLite automation using **Joins a group** for workshop communications. Keep those emails limited to registration confirmation and workshop communications unless the user has separately consented to general marketing.

Workshop forms accept an optional international phone number. The number is normalized to E.164 and
stored in MailerLite's standard `phone` field. SMS marketing requires a separate, unchecked consent;
opted-in attendees are also added to `MAILERLITE_SMS_MARKETING_GROUP_ID`, with consent recorded in
the `sms_marketing_consent`, `sms_consent_at` and `sms_consent_source` custom fields. An unchecked box
does not revoke consent previously given elsewhere. SMS delivery itself requires a separate provider
and must use only the dedicated opt-in group.

Paid workshops use Stripe Checkout. Set the workshop payment type, price and currency in Sanity. Free workshops register immediately through MailerLite; paid workshops redirect to Stripe and are only registered after Stripe sends a signed `checkout.session.completed` webhook to `/api/stripe/webhook`.

Configure the Stripe webhook for `checkout.session.completed` and
`checkout.session.async_payment_succeeded`. Stripe remains the payment record; after a successful
payment, the webhook reads the workshop or series from Sanity and adds the attendee to its MailerLite
groups.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
