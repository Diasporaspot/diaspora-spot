import { defineField, defineType } from 'sanity';
import { UniqueFeaturedInput } from '../components/UniqueFeaturedInput';

const bookingStatusOptions = [
  { title: 'Booking open', value: 'booking-open' },
  { title: 'Few spots left', value: 'few-spots' },
  { title: 'Waitlist', value: 'waitlist' },
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

export const workshop = defineType({
  name: 'workshop',
  title: 'Workshop',
  type: 'document',
  fields: [
    defineField({
      name: 'status',
      title: 'Website visibility',
      type: 'string',
      initialValue: 'draft',
      description:
        'Choose Published when this workshop is ready for the website, then use Sanity’s Publish button.',
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
      title: 'Workshop title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL name',
      type: 'slug',
      description: 'Generated from the workshop title. This becomes the readable URL name.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'oneLiner',
      title: 'Short headline',
      type: 'string',
      description: 'A punchy one-line benefit used on the homepage feature card.',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'time',
      title: 'Start time',
      type: 'string',
      description: 'Example: 11:00',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
            return true;
          }

          return 'Use 24-hour time in HH:MM format, for example 11:00.';
        }),
    }),
    defineField({
      name: 'timezone',
      title: 'Timezone',
      type: 'string',
      initialValue: 'WAT',
      description: 'Example: WAT, GMT, EST',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Example: 60 min',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      description: 'Example: Live online, Workshop lab, Office hours',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'host',
      title: 'Host name',
      type: 'string',
      description: 'The person, team, or group hosting this workshop.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'spotsLabel',
      title: 'Availability note',
      type: 'string',
      description: 'Example: 18 spots, 4 spots left, Waitlist open',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bookingStatus',
      title: 'Booking status',
      type: 'string',
      initialValue: 'booking-open',
      options: {
        list: bookingStatusOptions,
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Card icon',
      type: 'string',
      initialValue: 'document',
      options: {
        list: iconOptions,
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'iconTone',
      title: 'Icon color',
      type: 'string',
      initialValue: 'warm',
      options: {
        list: iconToneOptions,
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button text',
      type: 'string',
      initialValue: 'Reserve a seat',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mailerLiteGroupId',
      title: 'MailerLite group ID',
      type: 'string',
      description: 'Created automatically after this workshop is published.',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'mailerLiteGroupName',
      title: 'MailerLite group name',
      type: 'string',
      description: 'Use this group when configuring the workshop automation in MailerLite.',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'mailerLiteProvisioningStatus',
      title: 'Registration setup',
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
      rows: 3,
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Use this in the homepage and workshops page hero.',
      components: {
        input: UniqueFeaturedInput,
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      status: 'bookingStatus',
    },
    prepare({ title, date, status }) {
      return {
        title: title || 'Untitled workshop',
        subtitle: [status, date].filter(Boolean).join(' · '),
      };
    },
  },
});
