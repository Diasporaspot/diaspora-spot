import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, SlidersHorizontal, Users } from 'lucide-react';
import Topbar from '@/components/Topbar/Topbar';
import Footer from '@/components/Footer/Footer';
import { getUpcomingWorkshops } from '@/content/queries';
import type { Workshop } from '@/content/types';
import {
  formatWorkshopDate,
  WorkshopIconBadge,
  workshopStatusLabel,
} from '../../workshopShared';
import styles from '../../workshops-page.module.css';
import WorkshopRegistrationForm from './WorkshopRegistrationForm';

export const dynamic = 'force-dynamic';

type WorkshopRegistrationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function RegistrationSummary({ workshop }: { workshop: Workshop }) {
  return (
    <aside className={styles.registrationSummary} aria-label="Workshop summary">
      <div className={styles.registrationSummaryTop}>
        <WorkshopIconBadge workshop={workshop} />
        <span className={`${styles.status} ${styles[workshop.bookingStatus]}`}>
          {workshopStatusLabel[workshop.bookingStatus]}
        </span>
      </div>
      <div>
        <span className={styles.kicker}>{workshop.format}</span>
        <h2>{workshop.title}</h2>
        <p>{workshop.oneLiner}</p>
      </div>
      <div className={styles.registrationSummaryGrid}>
        <span>
          <CalendarDays size={17} />
          <small>Date</small>
          <strong>{formatWorkshopDate(workshop.date, { year: 'numeric' })}</strong>
        </span>
        <span>
          <Clock3 size={17} />
          <small>Time</small>
          <strong>
            {workshop.time} {workshop.timezone}
          </strong>
        </span>
        <span>
          <Users size={17} />
          <small>Seats</small>
          <strong>{workshop.spotsLabel}</strong>
        </span>
        <span>
          <SlidersHorizontal size={17} />
          <small>Duration</small>
          <strong>{workshop.duration}</strong>
        </span>
      </div>
      <div className={styles.registrationHost}>
        <span>Hosted by</span>
        <strong>{workshop.host}</strong>
      </div>
    </aside>
  );
}

export default async function WorkshopRegistrationPage({
  params,
}: WorkshopRegistrationPageProps) {
  const { slug } = await params;
  const workshops = await getUpcomingWorkshops();
  const workshop = workshops.find((item) => item.slug === slug);

  if (!workshop) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.registrationPage}>
          <div className={`wrap ${styles.registrationWrap}`}>
            <Link className={styles.backLink} href={`/workshops/${workshop.slug}`}>
              <ArrowLeft size={16} />
              Back to workshop details
            </Link>

            <div className={styles.registrationLayout}>
              <section className={styles.registrationCard} aria-labelledby="registration-title">
                <span className={styles.eyebrow}>Workshop registration</span>
                <h1 id="registration-title">Reserve your seat</h1>
                <p>
                  Enter your details below. The team will use your email to send confirmation,
                  reminders, and workshop updates.
                </p>

                {workshop.registrationReady ? (
                  <WorkshopRegistrationForm slug={workshop.slug} />
                ) : (
                  <div className={styles.registrationUnavailable} role="status">
                    <strong>Registration is opening soon.</strong>
                    <span>
                      This workshop has been published, but registration setup is not ready yet.
                      Please check back shortly.
                    </span>
                  </div>
                )}
              </section>

              <RegistrationSummary workshop={workshop} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
