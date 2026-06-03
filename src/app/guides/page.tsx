import Link from 'next/link';
import Topbar from '@/components/Topbar/Topbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/Button/Button';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import { getAllGuides, getGuideCategories } from '@/content/queries';
import GuidesList from './GuidesList';
import styles from './guides-page.module.css';

export const metadata = {
  title: 'Guides | DiasporaSpot',
  description: 'Practical guides, checklists, and templates for building life abroad.',
};

type GuidesPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

function getCategoryParam(category?: string | string[]) {
  return Array.isArray(category) ? category[0] : category;
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const [{ category }, guides, categories] = await Promise.all([
    searchParams,
    getAllGuides(),
    getGuideCategories(),
  ]);
  getCategoryParam(category);
  const featuredGuide = guides.find((guide) => guide.featured) ?? guides[0];
  const featuredMediaStyle = featuredGuide?.coverImage.url
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(43,38,34,0.06), rgba(43,38,34,0.2)), url(${featuredGuide.coverImage.url})`,
      }
    : undefined;

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.hero}>
          <div className="wrap">
            <div className={styles.heroGrid}>
              {featuredGuide ? (
                <>
                  <div className={styles.heroCopy}>
                    <TypewriterText text="Featured guide" className={styles.eyebrow} speed={32} />
                    <h1 className={styles.title}>{featuredGuide.title}</h1>
                    <p className={styles.intro}>{featuredGuide.summary}</p>
                    <div className={styles.heroMeta}>
                      <span>{featuredGuide.guideType}</span>
                      <span>{featuredGuide.stage}</span>
                      <span>{featuredGuide.readTime}</span>
                    </div>
                    <Button variant="inverse" href={`/guides/${featuredGuide.slug}`}>
                      {featuredGuide.ctaLabel}
                    </Button>
                  </div>
                  <Link
                    href={`/guides/${featuredGuide.slug}`}
                    className={styles.featuredCard}
                    aria-label={featuredGuide.title}
                  >
                    <span className={styles.featuredMedia} style={featuredMediaStyle} />
                  </Link>
                </>
              ) : (
                <div className={styles.heroCopy}>
                  <TypewriterText text="Guide library" className={styles.eyebrow} speed={32} />
                  <h1 className={styles.title}>Practical guides for life abroad.</h1>
                  <p className={styles.intro}>
                    Checklists, playbooks, templates, and resource lists for the decisions that
                    come after deciding to move.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={`wrap ${styles.index}`} aria-label="All guides">
          <div className={styles.indexHead}>
            <div>
              <span className={styles.sectionLabel}>Browse by topic</span>
              <h2 className={styles.sectionTitle}>Guide library</h2>
            </div>
          </div>

          <GuidesList guides={guides} categories={categories} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
