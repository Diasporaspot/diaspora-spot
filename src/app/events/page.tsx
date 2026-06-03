import Topbar from '@/components/Topbar/Topbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/Button/Button';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import { getUpcomingEvents } from '@/content/queries';
import EventsList from './EventsList';
import styles from './events-page.module.css';

export const metadata = {
  title: 'Events | DiasporaSpot',
  description: 'Community events and gatherings from DiasporaSpot.',
};

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

const statusLabel = {
  'registration-open': 'Registration open',
  'few-spots': 'Few spots left',
  'sold-out': 'Sold out',
  waitlist: 'Waitlist',
};

type EventsPageProps = {
  searchParams: Promise<{ type?: string | string[] }>;
};

function getTypeParam(type?: string | string[]) {
  const value = Array.isArray(type) ? type[0] : type;

  if (value === 'Online' || value === 'In person' || value === 'Hybrid') {
    return value;
  }

  return undefined;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const [{ type }, events] = await Promise.all([searchParams, getUpcomingEvents()]);
  getTypeParam(type);
  const featuredEvent = events.find((event) => event.featured) ?? events[0];
  const featuredMediaStyle = featuredEvent?.coverImage.url
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(43,38,34,0.08), rgba(43,38,34,0.24)), url(${featuredEvent.coverImage.url})`,
      }
    : undefined;

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.hero}>
          <div className="wrap">
            <div className={styles.heroGrid}>
              {featuredEvent ? (
                <>
                  <div className={styles.heroCopy}>
                    <TypewriterText text="Featured event" className={styles.eyebrow} speed={32} />
                    <h1 className={styles.title}>{featuredEvent.title}</h1>
                    <p className={styles.intro}>{featuredEvent.summary}</p>
                    <div className={styles.heroMeta}>
                      <span>{featuredEvent.eventType}</span>
                      <span>{formatDate(featuredEvent.date)}</span>
                      <span>
                        {featuredEvent.startTime}-{featuredEvent.endTime} {featuredEvent.timezone}
                      </span>
                    </div>
                    <Button variant="inverse" href={featuredEvent.registrationUrl}>
                      Register interest
                    </Button>
                  </div>
                  <div className={styles.featuredCard}>
                    <span className={styles.featuredMedia} style={featuredMediaStyle} />
                    <div className={styles.featuredDetails}>
                      <span className={`${styles.status} ${styles[featuredEvent.eventStatus]}`}>
                        {statusLabel[featuredEvent.eventStatus]}
                      </span>
                      <span>
                        {featuredEvent.startTime}-{featuredEvent.endTime} {featuredEvent.timezone}
                      </span>
                      <span>{featuredEvent.capacityLabel}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.heroCopy}>
                  <TypewriterText text="Events" className={styles.eyebrow} speed={32} />
                  <h1 className={styles.title}>Rooms for people building abroad.</h1>
                  <p className={styles.intro}>
                    Community gatherings, clinics, and mixers for people who want useful answers and
                    warmer networks.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={`wrap ${styles.index}`} aria-label="All events">
          <div className={styles.indexHead}>
            <div>
              <span className={styles.sectionLabel}>Browse by format</span>
              <h2 className={styles.sectionTitle}>Upcoming events</h2>
            </div>
          </div>
          <EventsList events={events} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
