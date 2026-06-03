import { defineArrayMember, defineField, defineType } from 'sanity';

export const tableBlock = defineType({
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'tableRow',
          title: 'Table row',
          type: 'object',
          fields: [
            defineField({
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
          ],
          preview: {
            select: {
              cells: 'cells',
            },
            prepare({ cells }: { cells?: string[] }) {
              return {
                title: cells?.filter(Boolean).join(' | ') || 'Table row',
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      columns: 'columns',
      rows: 'rows',
    },
    prepare({
      columns,
      rows,
    }: {
      columns?: string[];
      rows?: { cells?: string[] }[];
    }) {
      return {
        title: 'Table',
        subtitle: `${columns?.length ?? 0} columns, ${rows?.length ?? 0} rows`,
      };
    },
  },
});
