import { defineArrayMember, defineField, defineType } from 'sanity';
import { UniqueFeaturedInput } from '../components/UniqueFeaturedInput';

const articleTextBlock = defineArrayMember({
  type: 'block',
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'Heading 2', value: 'h2' },
    { title: 'Heading 3', value: 'h3' },
  ],
  lists: [
    { title: 'Bullet', value: 'bullet' },
    { title: 'Numbered', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Strong', value: 'strong' },
      { title: 'Emphasis', value: 'em' },
    ],
    annotations: [
      {
        name: 'link',
        title: 'Link',
        type: 'object',
        fields: [
          defineField({
            name: 'href',
            title: 'URL',
            type: 'url',
            validation: (rule) =>
              rule.uri({
                allowRelative: true,
                scheme: ['http', 'https', 'mailto', 'tel'],
              }),
          }),
        ],
      },
    ],
  },
});

export const article = defineType({
  name: 'article',
  title: 'Article',
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
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Short article summary used on cards and previews.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Career', value: 'Career' },
          { title: 'Money', value: 'Money' },
          { title: 'Housing', value: 'Housing' },
          { title: 'Visas', value: 'Visas' },
          { title: 'Community', value: 'Community' },
          { title: 'Culture', value: 'Culture' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'date',
    }),
    defineField({
      name: 'readTime',
      title: 'Read time',
      type: 'string',
      description: 'Example: "11 min read"',
    }),
    defineField({
      name: 'articleDetails',
      title: 'Article details',
      type: 'text',
      rows: 4,
      description: 'Sidebar summary shown on the article page under "Article Details".',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Only one article can be featured at a time.',
      components: {
        input: UniqueFeaturedInput,
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal notes',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Editorial/admin notes only.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description:
        'Main article editor. Use headings, paragraphs, links, bold text, and lists here. Add tables or FAQs only when needed.',
      of: [
        articleTextBlock,
        defineArrayMember({
          type: 'table',
          title: 'Table',
        }),
        defineArrayMember({
          type: 'faq',
          title: 'FAQ',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      media: 'coverImage',
    },
    prepare({ title, status, media }) {
      return {
        title: title || 'Untitled article',
        subtitle: status || 'draft',
        media,
      };
    },
  },
});
