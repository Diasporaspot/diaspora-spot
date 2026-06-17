import { defineField, defineType } from 'sanity';

const employmentTypeOptions = [
  { title: 'Full-time', value: 'Full-time' },
  { title: 'Part-time', value: 'Part-time' },
  { title: 'Contract', value: 'Contract' },
  { title: 'Internship', value: 'Internship' },
  { title: 'Volunteer', value: 'Volunteer' },
];

const locationTypeOptions = [
  { title: 'Remote', value: 'Remote' },
  { title: 'Hybrid', value: 'Hybrid' },
  { title: 'On-site', value: 'On-site' },
];

const seniorityOptions = [
  { title: 'Entry level', value: 'Entry level' },
  { title: 'Mid level', value: 'Mid level' },
  { title: 'Senior', value: 'Senior' },
  { title: 'Lead', value: 'Lead' },
  { title: 'Manager', value: 'Manager' },
];

export const job = defineType({
  name: 'job',
  title: 'Job',
  type: 'document',
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Job title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL name',
      type: 'slug',
      description: 'Generated from the job title. Used for anchors and future job detail pages.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'department',
      title: 'Team or department',
      type: 'string',
      description: 'Example: Community, Product, Operations, Content.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Example: Lagos, London, Global, Remote within EMEA.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'locationType',
      title: 'Location type',
      type: 'string',
      initialValue: 'Remote',
      options: {
        list: locationTypeOptions,
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'employmentType',
      title: 'Employment type',
      type: 'string',
      initialValue: 'Full-time',
      options: {
        list: employmentTypeOptions,
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seniority',
      title: 'Seniority',
      type: 'string',
      options: {
        list: seniorityOptions,
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'salaryRange',
      title: 'Salary or compensation range',
      type: 'string',
      description: 'Optional. Example: USD 2,000-3,500/month, Competitive, Equity available.',
    }),
    defineField({
      name: 'summary',
      title: 'Short summary',
      type: 'text',
      rows: 3,
      description: 'A concise overview shown on the job card.',
      validation: (rule) => rule.required().max(260),
    }),
    defineField({
      name: 'description',
      title: 'Role description',
      type: 'text',
      rows: 6,
      description: 'Describe the mission of the role and what success looks like.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'responsibilities',
      title: 'Responsibilities',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Add short bullet points for what this person will own.',
    }),
    defineField({
      name: 'requirements',
      title: 'Requirements',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Add short bullet points for skills, experience, or working style.',
    }),
    defineField({
      name: 'howToApply',
      title: 'How to apply',
      type: 'text',
      rows: 5,
      description:
        'Application instructions. Include the email address, subject line, CV/portfolio notes, and any requested links.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Application email',
      type: 'email',
      description: 'Optional. Used to show a quick email action beside the written instructions.',
    }),
    defineField({
      name: 'postedAt',
      title: 'Posted at',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'applyBy',
      title: 'Apply by',
      type: 'date',
      description: 'Optional application deadline.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Show this role in the careers page hero.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      department: 'department',
      location: 'location',
      status: 'status',
    },
    prepare({ title, department, location, status }) {
      return {
        title: title || 'Untitled job',
        subtitle: [status, department, location].filter(Boolean).join(' · '),
      };
    },
  },
});
