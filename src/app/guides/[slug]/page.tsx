import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import Topbar from '@/components/Topbar/Topbar';
import Footer from '@/components/Footer/Footer';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import { getGuideBySlug, getGuideSlugs } from '@/content/queries';
import type { ArticleBlock, ArticleTextSpan } from '@/content/types';
import styles from './guide-detail.module.css';

export async function generateStaticParams() {
  return getGuideSlugs();
}

export async function generateMetadata({ params }: PageProps<'/guides/[slug]'>) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return {
      title: 'Guide not found | DiasporaSpot',
    };
  }

  return {
    title: guide.seo.title,
    description: guide.seo.description,
  };
}

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function RichText({ spans }: { spans: ArticleTextSpan[] }) {
  return spans.map((span, index) => {
    let content: ReactNode = span.text;

    if (span.marks?.includes('strong')) {
      content = <strong>{content}</strong>;
    }

    if (span.marks?.includes('em')) {
      content = <em>{content}</em>;
    }

    if (span.href) {
      const isExternal = span.href.startsWith('http');

      content = (
        <Link
          href={span.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
        >
          {content}
        </Link>
      );
    }

    return <span key={`${span.text}-${index}`}>{content}</span>;
  });
}

function GuideBodyBlock({ block }: { block: ArticleBlock }) {
  if (block._type === 'heading') {
    if (block.level === 3) {
      return <h3>{block.text}</h3>;
    }

    return <h2>{block.text}</h2>;
  }

  if (block._type === 'list') {
    return (
      <ul>
        {block.items.map((item, index) => (
          <li key={index}>
            {Array.isArray(item) ? <RichText spans={item} /> : item}
          </li>
        ))}
      </ul>
    );
  }

  if (block._type === 'table') {
    return (
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              {block.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block._type === 'paragraph') {
    return <p>{block.children ? <RichText spans={block.children} /> : block.text}</p>;
  }

  return null;
}

export default async function GuideDetailPage({ params }: PageProps<'/guides/[slug]'>) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const mediaStyle = guide.coverImage.url
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(43,38,34,0.28), rgba(43,38,34,0.42)), url(${guide.coverImage.url})`,
      }
    : undefined;

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.hero} style={mediaStyle}>
          <div className="wrap">
            <div className={styles.heroInner}>
              <Link href="/guides" className={styles.backLink}>
                Back to guides
              </Link>
              <TypewriterText text={guide.guideType} className={styles.eyebrow} speed={32} />
              <h1 className={styles.title}>{guide.title}</h1>
              <p className={styles.summary}>{guide.summary}</p>
              <div className={styles.meta}>
                <span>{guide.category}</span>
                <span>{guide.stage}</span>
                <span>{guide.readTime}</span>
                <span>{formatDate(guide.publishedAt)}</span>
              </div>
            </div>
          </div>
        </section>

        <article className={`wrap ${styles.article}`}>
          <div className={styles.body}>
            {guide.body.map((block, index) => (
              <GuideBodyBlock key={index} block={block} />
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
