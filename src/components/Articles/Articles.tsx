'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/Button/Button';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import type { Article } from '@/content/types';
import styles from './articles.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const eyebrowText = 'Featured Content';

function ArticleCard({
  article,
}: {
  article: Article;
}) {
  const mediaStyle = article.coverImage.url
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(43,38,34,0) 50%, rgba(43,38,34,0.35) 100%), url(${article.coverImage.url})`,
      }
    : undefined;

  return (
    <motion.article
      className={styles.card}
      variants={{
        initial: { opacity: 0, y: 28, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/articles/${article.slug}`} className={styles.cardLink}>
        <div className={styles.media} style={mediaStyle}>
          <span className={styles.cat}>{article.category}</span>
        </div>
        <div className={styles.body}>
          <h3 className={styles.cardTitle}>{article.title}</h3>
          <p className={styles.excerpt}>{article.excerpt}</p>
          <span className={styles.meta}>
            {[article.readTime, formatArticleDate(article.publishedAt)].filter(Boolean).join(' · ')}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function FeaturedArticleCard({ article }: { article: Article }) {
  const mediaStyle = article.coverImage.url
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(43,38,34,0.04), rgba(43,38,34,0.22)), url(${article.coverImage.url})`,
      }
    : undefined;

  return (
    <motion.article
      className={styles.featuredCard}
      variants={{
        initial: { opacity: 0, y: 28, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/articles/${article.slug}`} className={styles.featuredLink}>
        <div className={styles.featuredMedia} style={mediaStyle}>
          <span className={styles.cat}>{article.category}</span>
        </div>
        <div className={styles.featuredBody}>
          <span className={styles.kicker}>Featured article</span>
          <h3 className={styles.featuredTitle}>{article.title}</h3>
          <p className={styles.featuredExcerpt}>{article.excerpt}</p>
          <span className={styles.meta}>
            {[article.readTime, formatArticleDate(article.publishedAt)].filter(Boolean).join(' · ')}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function formatArticleDate(date: string) {
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

function Articles({ articles }: { articles: Article[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [featuredArticle, ...recentArticles] = articles;

  return (
    <section className={styles.articles} id="articles" ref={ref}>
      <div className="wrap">
        <motion.header
          className={styles.head}
          variants={fadeUp}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div>
            <span className={styles.eyebrow}>
              <TypewriterText
                text={eyebrowText}
                active={inView}
                speed={38}
                className={styles.eyebrowText}
              />
            </span>
            <h2 className={styles.title}>The Diaspora Article Hub.</h2>
            <p className={styles.sub}>
              All the resources you need to build a successful life abroad.
            </p>
          </div>
        </motion.header>

        <motion.div
          className={styles.grid}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          variants={{
            animate: {
              transition: {
                delayChildren: 0.62,
                staggerChildren: 0.14,
              },
            },
          }}
        >
          {featuredArticle ? <FeaturedArticleCard article={featuredArticle} /> : null}
          <div className={styles.articleStack}>
          {recentArticles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.cta}
          variants={fadeUp}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          transition={{
            duration: 0.5,
            delay: 0.4,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        >
          <Button variant="primary" href="/articles">
            Read Articles <ArrowRight size={14} strokeWidth={2} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default Articles;
