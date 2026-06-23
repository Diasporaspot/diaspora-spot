This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Create a local `.env` file with the public Sanity values and the server-only MailerLite values:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=beibii8a
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-06-02
MAILERLITE_API_KEY=your_mailerlite_api_key
MAILERLITE_GROUP_ID=optional_existing_group_id
```

`MAILERLITE_GROUP_ID` is optional. When present, early-access submissions are added to that existing MailerLite group.

## Workshop registration workflow

Published workshops automatically receive a dedicated MailerLite group through the deployed `provision-workshop-mailerlite` Sanity Function. The function stores the generated group ID on the workshop and registration becomes available when setup is complete.

The function has its own server-side `MAILERLITE_API_KEY`, configured with the Sanity Functions environment-variable command. It does not require a webhook, callback URL, webhook secret, or manually managed Sanity write token.

Staff can find the generated group in MailerLite using the workshop title and date. They may optionally activate a MailerLite automation using **Joins a group** for workshop communications. Keep those emails limited to registration confirmation and workshop communications unless the user has separately consented to general marketing.

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
