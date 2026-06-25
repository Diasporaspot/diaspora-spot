import { CalendarDays, Clock3, Users } from 'lucide-react';
import { notFound } from 'next/navigation';
import Topbar from '@/components/Topbar/Topbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/Button/Button';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import { getUpcomingWorkshops } from '@/content/queries';
import type { Workshop } from '@/content/types';
import WorkshopExplorer from './WorkshopExplorer';
import { formatWorkshopDate, WorkshopIconBadge, workshopStatusLabel } from './workshopShared';
import styles from './workshops-page.module.css';

function WorkshopMeta({ workshop }: { workshop: Workshop }) {
  return (
    <div className={styles.meta}>
      <span>
        <CalendarDays size={15} strokeWidth={1.8} />
        {formatWorkshopDate(workshop.date)}
      </span>
      <span>
        <Clock3 size={15} strokeWidth={1.8} />
        {workshop.time} {workshop.timezone}
      </span>
      <span>
        <Users size={15} strokeWidth={1.8} />
        {workshop.spotsLabel}
      </span>
    </div>
  );
}

type WorkshopsPageContentProps = {
  activeWorkshopSlug?: string;
};

export default async function WorkshopsPageContent({ activeWorkshopSlug }: WorkshopsPageContentProps) {
  const workshops = await getUpcomingWorkshops();
  const featuredWorkshop = workshops.find((workshop) => workshop.featured) ?? workshops[0];

  if (activeWorkshopSlug && !workshops.some((workshop) => workshop.slug === activeWorkshopSlug)) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.hero}>
          <div className="wrap">
            {featuredWorkshop ? (
              <div className={styles.heroGrid}>
                <div className={styles.heroCopy}>
                  <TypewriterText
                    text="Featured workshop"
                    className={styles.eyebrow}
                    speed={32}
                  />
                  <h1 className={styles.title}>{featuredWorkshop.title}</h1>
                  <p className={styles.oneLiner}>{featuredWorkshop.oneLiner}</p>
                  <p className={styles.intro}>{featuredWorkshop.description}</p>
                  <Button variant="inverse" href={`/workshops/${featuredWorkshop.slug}`}>
                    View workshop
                  </Button>
                </div>
                <aside className={styles.featuredCard} aria-label="Featured workshop details">
                  <div className={styles.featuredTop}>
                    <WorkshopIconBadge workshop={featuredWorkshop} />
                    <span
                      className={`${styles.status} ${styles[featuredWorkshop.bookingStatus]}`}
                    >
                      {workshopStatusLabel[featuredWorkshop.bookingStatus]}
                    </span>
                  </div>
                  <WorkshopMeta workshop={featuredWorkshop} />
                  <div className={styles.featuredFooter}>
                    <span>{featuredWorkshop.format}</span>
                    <span>{featuredWorkshop.duration}</span>
                    <span>Hosted by {featuredWorkshop.host}</span>
                  </div>
                </aside>
              </div>
            ) : (
              <div className={styles.heroCopy}>
                <TypewriterText text="Workshops" className={styles.eyebrow} speed={32} />
                <h1 className={styles.title}>Practice with people who know the path.</h1>
                <p className={styles.intro}>
                  Live sessions for CVs, interviews, portfolios, and the practical career work that
                  helps you move forward abroad.
                </p>
              </div>
            )}
          </div>
        </section>

        <WorkshopExplorer workshops={workshops} />
      </main>
      <Footer />
    </div>
  );
}
