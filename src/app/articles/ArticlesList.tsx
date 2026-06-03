'use client';

import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import ContentList, {
  type ContentListFilter,
  type ContentListSort,
} from '@/components/ContentList/ContentList';
import type { Article } from '@/content/types';
import styles from './articles-page.module.css';

function getDateValue(value?: string) {
  if (!value) return 0;
  const parsedDate = new Date(value.includes('T') ? value : `${value}T00:00:00`);

  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

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

function ArticleCard({ article }: { article: Article }) {
  const mediaStyle = article.coverImage.url
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(43,38,34,0) 50%, rgba(43,38,34,0.38) 100%), url(${article.coverImage.url})`,
      }
    : undefined;

  return (
    <Link href={`/articles/${article.slug}`} className={styles.card}>
      <div className={styles.media} style={mediaStyle}>
        <span className={styles.category}>{article.category}</span>
      </div>
      <div className={styles.body}>
        <h2 className={styles.cardTitle}>{article.title}</h2>
        <p className={styles.excerpt}>{article.excerpt}</p>
        <span className={styles.meta}>
          {[article.readTime, formatDate(article.publishedAt)].filter(Boolean).join(' · ')}
        </span>
      </div>
    </Link>
  );
}

type ArticlesListProps = {
  articles: Article[];
  categories: string[];
};

export default function ArticlesList({ articles, categories }: ArticlesListProps) {
  const filters: ContentListFilter<Article>[] = [
    {
      id: 'category',
      label: 'Filter by category',
      icon: <SlidersHorizontal size={16} />,
      options: [
        { label: 'All categories', value: 'all' },
        ...categories.map((category) => ({ label: category, value: category })),
      ],
      predicate: (article, value) => value === 'all' || article.category === value,
    },
  ];
  const sorts: ContentListSort<Article>[] = [
    {
      label: 'Newest first',
      value: 'newest',
      compare: (a, b) =>
        getDateValue(b.publishedAt) - getDateValue(a.publishedAt) ||
        getDateValue(b.createdAt) - getDateValue(a.createdAt),
    },
    {
      label: 'Alphabetical A-Z',
      value: 'az',
      compare: (a, b) => a.title.localeCompare(b.title),
    },
  ];

  return (
    <ContentList
      ariaLabel="Article list"
      emptyMessage="No published articles match those filters."
      filters={filters}
      getSearchText={(article) =>
        [article.title, article.excerpt, article.category, article.author].join(' ')
      }
      gridClassName={styles.grid}
      items={articles}
      pageSize={6}
      renderItem={(article) => <ArticleCard key={article._id} article={article} />}
      searchPlaceholder="Search articles"
      sorts={sorts}
    />
  );
}
