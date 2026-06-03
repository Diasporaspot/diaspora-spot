import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import Topbar from '@/components/Topbar/Topbar';
import Footer from '@/components/Footer/Footer';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import { getArticleBySlug } from '@/content/queries';
import type { ArticleBlock, ArticleTextSpan } from '@/content/types';
import styles from './article-detail.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps<'/articles/[slug]'>) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article not found | DiasporaSpot',
    };
  }

  return {
    title: article.seo.title,
    description: article.seo.description,
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

function ArticleBodyBlock({ block }: { block: ArticleBlock }) {
  if (block._type === 'heading') {
    if (block.level === 3) {
      return <h3>{block.text}</h3>;
    }

    return <h2>{block.text}</h2>;
  }

  if (block._type === 'list') {
    return (
      <ul>
        {block.items.map((item, index) => {
          if (Array.isArray(item)) {
            return (
              <li key={index}>
                <RichText spans={item} />
              </li>
            );
          }

          return <li key={item}>{item}</li>;
        })}
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
            {block.rows.map((row) => (
              <tr key={row.join('-')}>
                {row.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block._type === 'faq') {
    return (
      <div className={styles.faqList}>
        {block.items.map((item) => (
          <section key={item.question} className={styles.faqItem}>
            <h3>{item.question}</h3>
            <p>
              <RichText spans={item.answer} />
            </p>
          </section>
        ))}
      </div>
    );
  }

  if (block._type === 'quote') {
    return (
      <blockquote className={styles.quote}>
        {block.text}
        {block.attribution ? <cite>{block.attribution}</cite> : null}
      </blockquote>
    );
  }

  if (block.children) {
    return (
      <p>
        <RichText spans={block.children} />
      </p>
    );
  }

  return <p>{block.text}</p>;
}

export default async function ArticleDetailPage({ params }: PageProps<'/articles/[slug]'>) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const heroStyle = article.coverImage.url
    ? {
        backgroundImage: `url(${article.coverImage.url})`,
      }
    : undefined;

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.hero} style={heroStyle}>
          <div className={`wrap ${styles.heroInner}`}>
            <Link href="/articles" className={styles.backLink}>
              <TypewriterText text="Back to articles" speed={38} />
            </Link>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.excerpt}>{article.excerpt}</p>
            <div className={styles.meta}>
              <TypewriterText
                text={article.category}
                className={styles.category}
                speed={46}
              />
              <span>{article.author}</span>
              {formatDate(article.publishedAt) ? <span>{formatDate(article.publishedAt)}</span> : null}
              <span>{article.readTime}</span>
            </div>
          </div>
        </section>

        <section className="wrap">
          <div className={styles.articleShell}>
            <article className={styles.content}>
              {article.body.map((block, index) => (
                <ArticleBodyBlock key={`${block._type}-${index}`} block={block} />
              ))}
            </article>

            <aside className={styles.aside} aria-label="Article details">
              <h2 className={styles.asideTitle}>Article Details</h2>
              <p className={styles.asideText}>
                {article.articleDetails ||
                  'Written for diaspora professionals looking for practical guidance they can use while building life abroad.'}
              </p>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
