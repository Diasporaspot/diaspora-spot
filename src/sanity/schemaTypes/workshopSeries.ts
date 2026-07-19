import { defineField, defineType } from 'sanity';

const salesStatusOptions = [
  { title: 'Booking open', value: 'booking-open' },
  { title: 'Few spots left', value: 'few-spots' },
  { title: 'Waitlist', value: 'waitlist' },
  { title: 'Closed', value: 'closed' },
];

const currencyOptions = [
  { title: 'USD', value: 'usd' },
  { title: 'GBP', value: 'gbp' },
  { title: 'EUR', value: 'eur' },
  { title: 'NGN', value: 'ngn' },
];

const iconOptions = [
  { title: 'Document', value: 'document' },
  { title: 'Briefcase', value: 'briefcase' },
  { title: 'Conversation', value: 'conversation' },
  { title: 'People', value: 'people' },
  { title: 'Calendar', value: 'calendar' },
  { title: 'Globe', value: 'globe' },
  { title: 'Target', value: 'target' },
  { title: 'Presentation', value: 'presentation' },
  { title: 'Checklist', value: 'checklist' },
  { title: 'Map pin', value: 'map-pin' },
];

const iconToneOptions = [
  { title: 'Warm', value: 'warm' },
  { title: 'Gold', value: 'gold' },
  { title: 'Dark', value: 'dark' },
  { title: 'Green', value: 'green' },
  { title: 'Blue', value: 'blue' },
];

type WorkshopReference = {
  _ref?: string;
};

export const workshopSeries = defineType({
  name: 'workshopSeries',
  title: 'Workshop series',
  type: 'document',
  fields: [
    defineField({
      name: 'status',
      title: 'Website visibility',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Series title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL name',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'oneLiner',
      title: 'Short headline',
      type: 'string',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'workshops',
      title: 'Workshops in this series',
      description:
        'Arrange the workshops in the order participants should take them. A workshop should only appear in one published series.',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'workshop' }],
          options: { disableNew: true },
        },
      ],
      validation: (rule) => [
        rule.required().min(1).unique(),
        rule
          .custom(async (value, context) => {
            const references = (value as WorkshopReference[] | undefined)
              ?.map((item) => item?._ref)
              .filter((reference): reference is string => Boolean(reference));

            if (!references?.length) {
              return true;
            }

            const documentId = context.document?._id?.replace(/^drafts\./, '') ?? '';
            const client = context.getClient({ apiVersion: '2025-06-02' });
            const conflicts = await client.fetch<string[]>(
              `*[
                _type == "workshopSeries" &&
                status == "published" &&
                !(_id in [$documentId, "drafts." + $documentId]) &&
                count(workshops[@._ref in $references]) > 0
              ].title`,
              { documentId, references },
            );

            return conflicts.length
              ? `One or more workshops are already used by: ${conflicts.join(', ')}.`
              : true;
          })
          .warning(),
      ],
    }),
    defineField({
      name: 'salesStatus',
      title: 'Series availability',
      type: 'string',
      initialValue: 'booking-open',
      options: { list: salesStatusOptions, layout: 'dropdown' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'allowWaitlistedWorkshops',
      title: 'Allow registration when an included workshop is waitlisted',
      description:
        'Leave this off unless the series allocation can still guarantee a place in every included workshop.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'paymentType',
      title: 'Payment type',
      type: 'string',
      description: 'A series that includes any paid workshop must also be paid.',
      initialValue: 'free',
      options: {
        list: [
          { title: 'Free', value: 'free' },
          { title: 'Paid', value: 'paid' },
        ],
        layout: 'radio',
      },
      validation: (rule) => [
        rule.required(),
        rule
          .custom(async (value, context) => {
            if (value !== 'free') {
              return true;
            }

            const references = (context.document?.workshops as WorkshopReference[] | undefined)
              ?.map((item) => item?._ref)
              .filter((reference): reference is string => Boolean(reference));

            if (!references?.length) {
              return true;
            }

            const paidCount = await context
              .getClient({ apiVersion: '2025-06-02' })
              .fetch<number>(
                'count(*[_type == "workshop" && _id in $references && paymentType == "paid"])',
                { references },
              );

            return paidCount > 0
              ? 'This series includes a paid workshop. Change the series payment type to Paid and set its price.'
              : true;
          }),
      ],
    }),
    defineField({
      name: 'price',
      title: 'Series price',
      type: 'number',
      initialValue: 0,
      description: 'This price is independent of the individual workshop prices.',
      hidden: ({ parent }) => parent?.paymentType !== 'paid',
      validation: (rule) => [
        rule.custom((value, context) => {
          if (context.parent && (context.parent as { paymentType?: string }).paymentType === 'paid') {
            return typeof value === 'number' && value > 0
              ? true
              : 'Enter a price greater than 0 for a paid series.';
          }

          return true;
        }),
        rule
          .custom(async (value, context) => {
            const document = context.document as
              | {
                  currency?: string;
                  paymentType?: string;
                  workshops?: WorkshopReference[];
                }
              | undefined;
            const references = document?.workshops
              ?.map((item) => item?._ref)
              .filter((reference): reference is string => Boolean(reference));

            if (
              document?.paymentType !== 'paid' ||
              typeof value !== 'number' ||
              !document.currency ||
              !references?.length
            ) {
              return true;
            }

            const workshopPrices = await context
              .getClient({ apiVersion: '2025-06-02' })
              .fetch<{ currency?: string; paymentType?: string; price?: number }[]>(
                '*[_type == "workshop" && _id in $references]{currency, paymentType, price}',
                { references },
              );
            const paidWorkshops = workshopPrices.filter(
              (workshop) => workshop.paymentType === 'paid',
            );
            const hasMixedPaidCurrencies = paidWorkshops.some(
              (workshop) => workshop.currency !== document.currency,
            );
            const individualTotal = paidWorkshops.reduce(
              (total, workshop) => total + (workshop.price ?? 0),
              0,
            );

            return !hasMixedPaidCurrencies && paidWorkshops.length > 0 && value > individualTotal
              ? `This series costs more than the ${document.currency.toUpperCase()} ${individualTotal} individual total.`
              : true;
          })
          .warning(),
      ],
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'usd',
      hidden: ({ parent }) => parent?.paymentType !== 'paid',
      options: { list: currencyOptions, layout: 'dropdown' },
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.parent && (context.parent as { paymentType?: string }).paymentType === 'paid') {
            return value ? true : 'Choose a currency for a paid series.';
          }

          return true;
        }),
    }),
    defineField({
      name: 'icon',
      title: 'Card icon',
      type: 'string',
      initialValue: 'presentation',
      options: { list: iconOptions, layout: 'dropdown' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'iconTone',
      title: 'Icon color',
      type: 'string',
      initialValue: 'gold',
      options: { list: iconToneOptions, layout: 'dropdown' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button text',
      type: 'string',
      initialValue: 'Get the complete series',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mailerLiteGroupId',
      title: 'MailerLite group ID',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'mailerLiteGroupName',
      title: 'MailerLite group name',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'mailerLiteProvisioningStatus',
      title: 'Series registration setup',
      type: 'string',
      initialValue: 'pending',
      options: {
        list: [
          { title: 'Setting up registration...', value: 'pending' },
          { title: 'Registration ready', value: 'ready' },
          { title: 'Setup failed - publish again to retry', value: 'failed' },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: 'mailerLiteProvisioningError',
      title: 'MailerLite setup error',
      type: 'text',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'featured',
      title: 'Featured series',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal notes',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'salesStatus',
      workshops: 'workshops',
    },
    prepare({ title, status, workshops }) {
      const workshopCount = Array.isArray(workshops) ? workshops.length : 0;
      return {
        title: title || 'Untitled workshop series',
        subtitle: [status, `${workshopCount} workshop${workshopCount === 1 ? '' : 's'}`]
          .filter(Boolean)
          .join(' · '),
      };
    },
  },
});
