import { defineArrayMember, defineField, defineType } from 'sanity';

const richAnswerBlock = defineArrayMember({
  type: 'block',
  styles: [],
  lists: [],
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

export const faqBlock = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'faqItem',
          title: 'FAQ item',
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'array',
              of: [richAnswerBlock],
            }),
          ],
          preview: {
            select: {
              title: 'question',
            },
            prepare({ title }: { title?: string }) {
              return {
                title: title || 'FAQ item',
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      items: 'items',
    },
    prepare({ items }: { items?: { question?: string }[] }) {
      return {
        title: 'FAQ',
        subtitle: `${items?.length ?? 0} items`,
      };
    },
  },
});
