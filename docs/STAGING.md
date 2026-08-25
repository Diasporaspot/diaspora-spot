# Staging and production workflow

The website uses one long-lived `staging` Git branch and `main` as the production branch.

| Concern | Staging | Production |
| --- | --- | --- |
| Git branch | `staging` | `main` |
| Vercel environment | Preview, scoped to `staging` | Production |
| Website URL | `https://diasporaspotstaging.vercel.app` | `https://diasporaspot.com` |
| `SITE_ENV` | `staging` | `production` |
| Article visibility | `staging` and `published` | `published` only |
| Search indexing | Disabled | Enabled |

## One-time Sanity setup

1. In Sanity Manage, open the DiasporaSpot project and create an API token with **Viewer** access.
2. Keep the existing `production` dataset. Article workflow state, not a second dataset, controls website visibility.
3. Deploy the updated Studio schema with `npx sanity deploy` (or run `npm run studio` while testing it locally).
4. Store the Viewer token only as `SANITY_API_READ_TOKEN`. Never prefix it with `NEXT_PUBLIC_`.

The staging website uses Sanity's draft perspective. That means an editor can review an update to an
already-live article while the currently published version remains unchanged on production.

### Article editorial workflow

For a new article:

1. Create the article and set **Website visibility** to **Staging**.
2. Let Sanity autosave the draft. Do not click Sanity's **Publish** button yet.
3. Review it on the staging website.
4. When approved, change **Website visibility** to **Published**, then click **Publish**.

For an article that is already live:

1. Open it and change **Website visibility** to **Staging** before making the review edits.
2. Review the autosaved draft on staging. Production continues to serve the last published version.
3. When approved, change the draft back to **Published**, then click **Publish**.

Setting an article to **Draft** hides its draft from both websites. Publishing a document while its
status is **Staging** would replace the live version with a staging-only version, so promotion must
always be **Published status first, Sanity Publish second**.

### Workshop editorial and payment workflow

Workshops and workshop series use the same **Draft → Staging → Published** visibility workflow as
articles. Staged workshop drafts are visible only at `https://diasporaspotstaging.vercel.app`.

Staging registration is intentionally isolated:

- Paid registrations use Stripe test mode and the staging-only webhook.
- Free and paid staging registrations do not add subscribers to MailerLite or send confirmation
  emails.
- Production continues to use Stripe live mode and the existing MailerLite groups.

For a Stripe test checkout, use card number `4242 4242 4242 4242`, any future expiry date, and any
three-digit CVC. No real charge is created.

### Job editorial workflow

Jobs use the same **Draft → Staging → Published** visibility workflow. A staged job appears on the
staging careers page only. When approved, change its visibility to **Published**, then click
Sanity’s **Publish** button.

## One-time Vercel setup

1. Connect `Diasporaspot/diaspora-spot` to one Vercel project.
2. In **Project Settings → Environments → Production → Branch Tracking**, keep `main` as the
   production branch.
3. Push a long-lived `staging` branch. Vercel creates a branch-specific `*.vercel.app` URL that
   always points to the latest successful deployment from that branch. Use that URL as the client QA
   link.
4. Keep `diasporaspot.com` assigned to the Production environment. Do not assign it to `staging`.
5. In **Project Settings → Environment Variables**, enable automatic exposure of Vercel system
   environment variables. The application also has safe Vercel-aware defaults, but explicit values
   make the setup auditable.

Configure these variables:

| Variable | `staging` Preview branch | Production |
| --- | --- | --- |
| `SITE_ENV` | `staging` | `production` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `beibii8a` | `beibii8a` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2025-06-02` | `2025-06-02` |
| `SANITY_API_READ_TOKEN` | Viewer token | not required |
| `NEXT_PUBLIC_SITE_URL` | `https://diasporaspotstaging.vercel.app` | `https://diasporaspot.com` |
| `STRIPE_SECRET_KEY` | Stripe test key (`sk_test_...`) | Stripe live key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Staging test webhook signing secret | Production webhook signing secret |

Add the staging values as **Preview variables scoped specifically to the `staging` Git branch**.
Vercel branch-specific values override the general Preview values.

All other environment variables from `.env.example` must also be reviewed. For safe end-to-end
testing, Preview should use a separate Supabase project when staged features write to Supabase.
Stripe is isolated with test keys and a staging webhook, and MailerLite writes are suppressed by the
application on staging. Do not copy other production write credentials into Preview merely to make
a build pass. Public/read-only values can be shared where appropriate.

After changing any Vercel environment variable, redeploy the affected branch; environment changes do
not alter deployments that already exist.

## Day-to-day release flow

```text
feature branch → pull request into staging → client QA on diasporaspotstaging.vercel.app
              → fixes into staging       → pull request staging into main
              → merge to main            → production deploy to diasporaspot.com
```

Keep `staging` after each release. Once `main` is deployed, merge `main` back into `staging` if the
branches differ so the next release starts from the exact production baseline.

Recommended GitHub branch protection:

- Require pull requests and a successful Vercel check before merging into `staging`.
- Require pull requests, a successful Vercel check, and client approval before merging into `main`.
- Disable direct pushes to `main`.

## Verification checklist

- A push to `staging` updates the stable Vercel branch URL and not `diasporaspot.com`.
- A Sanity article in **Staging** appears at the staging URL and returns 404 in production.
- A Sanity workshop or series in **Staging** appears at the staging URL and not in production.
- A Sanity job in **Staging** appears on the staging careers page and not in production.
- A paid staging workshop opens Stripe test checkout and returns to the staging URL after payment.
- A draft edit to an already-published article appears on staging while production keeps the old copy.
- Promoting the article to **Published** and publishing it makes it visible in production.
- Staging pages output `noindex, nofollow`; production pages remain indexable.
- A merge to `main` creates a Production deployment and keeps `diasporaspot.com` assigned to it.
