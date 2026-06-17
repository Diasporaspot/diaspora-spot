import Button from '@/components/Button/Button';
import Footer from '@/components/Footer/Footer';
import Topbar from '@/components/Topbar/Topbar';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import { getAllJobs } from '@/content/queries';
import CareersList from './CareersList';
import styles from './careers-page.module.css';

export const metadata = {
  title: 'Careers | DiasporaSpot',
  description:
    'Join the DiasporaSpot team and help build practical infrastructure for people growing their lives abroad.',
};

export const dynamic = 'force-dynamic';

function formatDate(date?: string) {
  if (!date) return null;

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

export default async function CareersPage() {
  const jobs = await getAllJobs();
  const featuredJob = jobs.find((job) => job.featured) ?? jobs[0];
  const departments = Array.from(new Set(jobs.map((job) => job.department).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.hero}>
          <div className="wrap">
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <TypewriterText text="Careers" className={styles.eyebrow} speed={32} />
                <h1 className={styles.title}>Build for ambitious diasporans.</h1>
                <p className={styles.intro}>
                  DiasporaSpot is a team building useful, culturally fluent tools for people moving,
                  working, investing, and finding community across borders.
                </p>
                <div className={styles.heroMeta}>
                  <span>Remote-aware team</span>
                  <span>Mission-led work</span>
                </div>
                <Button variant="inverse" href="#open-roles">
                  View open roles
                </Button>
              </div>

              <aside className={styles.featuredPanel} aria-label="Featured career opportunity">
                {featuredJob ? (
                  <>
                    <span className={styles.panelLabel}>Featured role</span>
                    <h2>{featuredJob.title}</h2>
                    <p>{featuredJob.summary}</p>
                    <div className={styles.panelMeta}>
                      <span>{featuredJob.department}</span>
                      <span>{featuredJob.location}</span>
                      <span>{featuredJob.employmentType}</span>
                      {featuredJob.applyBy ? (
                        <span>Apply by {formatDate(featuredJob.applyBy)}</span>
                      ) : null}
                    </div>
                    <Button variant="ghost" href={`#${featuredJob.slug || featuredJob._id}`}>
                      Read role
                    </Button>
                  </>
                ) : (
                  <>
                    <span className={styles.panelLabel}>Hiring updates</span>
                    <h2>No open roles right now.</h2>
                  </>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section className={`wrap ${styles.index}`} id="open-roles" aria-label="Open roles">
          <div className={styles.indexHead}>
            <div>
              <span className={styles.sectionLabel}>Open roles</span>
              <h2 className={styles.sectionTitle}>
                {jobs.length > 0 ? 'Current opportunities' : 'No current openings'}
              </h2>
            </div>
          </div>

          {jobs.length > 0 ? (
            <CareersList departments={departments} jobs={jobs} />
          ) : (
            <div className={styles.emptyState}>
              <span>Careers</span>
              <h3>No open roles right now.</h3>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
