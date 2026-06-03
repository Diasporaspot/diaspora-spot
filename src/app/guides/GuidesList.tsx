'use client';

import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import ContentList, {
  type ContentListFilter,
  type ContentListSort,
} from '@/components/ContentList/ContentList';
import type { Guide } from '@/content/types';
import styles from './guides-page.module.css';

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function GuideCard({ guide }: { guide: Guide }) {
  const mediaStyle = guide.coverImage.url
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(43,38,34,0) 50%, rgba(43,38,34,0.38) 100%), url(${guide.coverImage.url})`,
      }
    : undefined;

  return (
    <Link href={`/guides/${guide.slug}`} className={styles.card}>
      <div className={styles.media} style={mediaStyle}>
        <span className={styles.category}>{guide.guideType}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.cardMetaTop}>
          <span>{guide.category}</span>
          <span>{guide.stage}</span>
        </div>
        <h2 className={styles.cardTitle}>{guide.title}</h2>
        <p className={styles.excerpt}>{guide.summary}</p>
        <span className={styles.meta}>
          {[guide.readTime, formatDate(guide.publishedAt)].filter(Boolean).join(' · ')}
        </span>
      </div>
    </Link>
  );
}

type GuidesListProps = {
  categories: string[];
  guides: Guide[];
};

export default function GuidesList({ categories, guides }: GuidesListProps) {
  const filters: ContentListFilter<Guide>[] = [
    {
      id: 'category',
      label: 'Filter by category',
      icon: <SlidersHorizontal size={16} />,
      options: [
        { label: 'All categories', value: 'all' },
        ...categories.map((category) => ({ label: category, value: category })),
      ],
      predicate: (guide, value) => value === 'all' || guide.category === value,
    },
  ];
  const sorts: ContentListSort<Guide>[] = [
    {
      label: 'Newest first',
      value: 'newest',
      compare: (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    },
    {
      label: 'Alphabetical A-Z',
      value: 'az',
      compare: (a, b) => a.title.localeCompare(b.title),
    },
  ];

  return (
    <ContentList
      ariaLabel="Guide list"
      emptyMessage="No guides match those filters."
      filters={filters}
      getSearchText={(guide) =>
        [guide.title, guide.summary, guide.category, guide.stage, guide.guideType].join(' ')
      }
      gridClassName={styles.grid}
      items={guides}
      pageSize={6}
      renderItem={(guide) => <GuideCard key={guide._id} guide={guide} />}
      searchPlaceholder="Search guides"
      sorts={sorts}
    />
  );
}
