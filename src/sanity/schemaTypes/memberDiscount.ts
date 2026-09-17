import { defineField, defineType } from 'sanity';

export const memberDiscount = defineType({
  name: 'memberDiscount',
  title: 'Member discount',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Internal name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'status', title: 'Website visibility', type: 'string', initialValue: 'staging',
      options: { list: [{ title: 'Disabled', value: 'disabled' }, { title: 'Staging', value: 'staging' }, { title: 'Published', value: 'published' }] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'code', title: 'Code', type: 'string',
      description: 'Reusable across eligible events. An active or trialing paid subscription is required. Members must sign in and book with their account email. Avoid using the same code on individual events.',
      validation: (rule) => rule.required().max(64).regex(/^[A-Za-z0-9_-]+$/),
    }),
    defineField({ name: 'type', title: 'Discount type', type: 'string', initialValue: 'percentage', options: { list: [{ title: 'Percentage off', value: 'percentage' }, { title: 'Fixed amount off', value: 'amount' }] }, validation: (rule) => rule.required() }),
    defineField({
      name: 'value', title: 'Discount value', type: 'number',
      validation: (rule) => rule.required().positive().custom((value, context) => (context.parent as { type?: string })?.type === 'percentage' && Number(value) > 100 ? 'Percentage cannot exceed 100.' : true),
    }),
    defineField({
      name: 'currency', title: 'Currency', type: 'string', initialValue: 'gbp',
      description: 'Fixed discounts only apply to events priced in this currency.',
      hidden: ({ parent }) => parent?.type !== 'amount',
      options: { list: ['gbp', 'usd', 'eur', 'ngn'] },
      validation: (rule) => rule.custom((value, context) => (context.parent as { type?: string })?.type === 'amount' && !value ? 'Choose a currency.' : true),
    }),
    defineField({
      name: 'scope', title: 'Eligible events', type: 'string', initialValue: 'all',
      options: { list: [{ title: 'All paid workshops', value: 'all' }, { title: 'Selected workshops', value: 'selected' }] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'workshops', title: 'Workshops', type: 'array', of: [{ type: 'reference', to: [{ type: 'workshop' }] }],
      hidden: ({ parent }) => parent?.scope !== 'selected',
      validation: (rule) => rule.custom((value, context) => (context.parent as { scope?: string })?.scope === 'selected' && !value?.length ? 'Select at least one workshop.' : true),
    }),
    defineField({ name: 'startDate', title: 'Start date', type: 'date', validation: (rule) => rule.required() }),
    defineField({ name: 'noExpiry', title: 'No expiry date', type: 'boolean', initialValue: true, description: 'Remains available while the member qualifies. Disable this discount to stop new uses.' }),
    defineField({
      name: 'endDate', title: 'End date', type: 'date', hidden: ({ parent }) => parent?.noExpiry === true,
      validation: (rule) => rule.custom((value, context) => {
        const parent = context.parent as { noExpiry?: boolean; startDate?: string };
        return parent.noExpiry || (value && parent.startDate && value >= parent.startDate) ? true : 'Choose an end date on or after the start date.';
      }),
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'code' } },
});
