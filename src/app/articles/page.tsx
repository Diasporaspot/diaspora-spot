import Link from 'next/link';
import Topbar from '@/components/Topbar/Topbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/Button/Button';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import { getAllArticles, getArticleCategories } from '@/content/queries';
import ArticlesList from './ArticlesList';
import styles from './articles-page.module.css';

export const metadata = {
  title: 'Articles | DiasporaSpot',
  description: 'Articles and practical resources for building your life abroad.',
};

export const dynamic = 'force-dynamic';

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

type ArticlesPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

function getCategoryParam(category?: string | string[]) {
  return Array.isArray(category) ? category[0] : category;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const [{ category }, articles, categories] = await Promise.all([
    searchParams,
    getAllArticles(),
    getArticleCategories(),
  ]);
  getCategoryParam(category);
  const featuredArticle = articles.find((article) => article.featured) ?? articles[0];
  const featuredMediaStyle = featuredArticle?.coverImage.url
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(43,38,34,0.06), rgba(43,38,34,0.2)), url(${featuredArticle.coverImage.url})`,
      }
    : undefined;

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.hero}>
          <div className="wrap">
            <div className={styles.heroGrid}>
              {featuredArticle ? (
                <>
                  <div className={styles.heroCopy}>
                    <TypewriterText
                      text="Featured article"
                      className={styles.eyebrow}
                      speed={32}
                    />
                    <h1 className={styles.title}>{featuredArticle.title}</h1>
                    <p className={styles.intro}>{featuredArticle.excerpt}</p>
                    <div className={styles.heroMeta}>
                      <span>{featuredArticle.category}</span>
                      <span>{featuredArticle.readTime}</span>
                      <span>{formatDate(featuredArticle.publishedAt)}</span>
                    </div>
                    <Button variant="inverse" href={`/articles/${featuredArticle.slug}`}>
                      Read article
                    </Button>
                  </div>
                  <Link
                    href={`/articles/${featuredArticle.slug}`}
                    className={styles.featuredCard}
                    aria-label={featuredArticle.title}
                  >
                    <span className={styles.featuredMedia} style={featuredMediaStyle} />
                  </Link>
                </>
              ) : (
                <div className={styles.heroCopy}>
                  <TypewriterText text="Article Hub" className={styles.eyebrow} speed={32} />
                  <h1 className={styles.title}>Articles for life abroad.</h1>
                  <p className={styles.intro}>
                    Practical articles for careers, money, housing, visas, and the small details
                    that make moving countries feel less confusing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={`wrap ${styles.index}`} aria-label="All articles">
          <div className={styles.indexHead}>
            <div>
              <span className={styles.sectionLabel}>Browse by topic</span>
              <h2 className={styles.sectionTitle}>Latest articles</h2>
            </div>
          </div>
          <ArticlesList articles={articles} categories={categories} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
