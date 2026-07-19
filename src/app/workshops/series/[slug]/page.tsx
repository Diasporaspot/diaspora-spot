import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  CalendarDays,
  CalendarRange,
  Check,
  Clock3,
  CreditCard,
  Layers3,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Footer from '@/components/Footer/Footer';
import Topbar from '@/components/Topbar/Topbar';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import { getWorkshopSeriesBySlug } from '@/content/queries';
import type { WorkshopSeries } from '@/content/types';
import {
  SeriesCurriculumHead,
  SeriesHeroCopy,
  SeriesPricePanel,
  SeriesSessionItem,
} from '../SeriesMotion';
import {
  formatWorkshopDate,
  formatWorkshopPrice,
  formatWorkshopSeriesPrice,
  WorkshopIconBadge,
  workshopSeriesStatusLabel,
  workshopStatusLabel,
} from '../../workshopShared';
import styles from '../../workshops-page.module.css';

export const dynamic = 'force-dynamic';

function getIndividualTotal(series: WorkshopSeries) {
  if (series.paymentType !== 'paid') {
    return null;
  }

  const paidWorkshops = series.workshops.filter((workshop) => workshop.paymentType === 'paid');

  if (
    !paidWorkshops.length ||
    paidWorkshops.some((workshop) => workshop.currency !== series.currency)
  ) {
    return null;
  }

  return paidWorkshops.reduce((total, workshop) => total + workshop.price, 0);
}

function getSeriesDateRange(series: WorkshopSeries) {
  const dates = series.workshops.map((workshop) => workshop.date).filter(Boolean).sort();

  if (!dates.length) {
    return 'Dates to be announced';
  }

  const firstDate = formatWorkshopDate(dates[0], { year: 'numeric' });
  const lastDate = formatWorkshopDate(dates.at(-1) ?? dates[0], { year: 'numeric' });

  return firstDate === lastDate ? firstDate : `${firstDate} – ${lastDate}`;
}

export default async function WorkshopSeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getWorkshopSeriesBySlug(slug);

  if (!series) {
    notFound();
  }

  const individualTotal = getIndividualTotal(series);
  const saving = individualTotal !== null ? individualTotal - series.price : 0;
  const priceLabel = formatWorkshopSeriesPrice(series);
  const canRegister =
    series.registrationReady &&
    !series.pricingConflict &&
    series.salesStatus !== 'closed' &&
    series.salesStatus !== 'waitlist';

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.seriesDetailHero}>
          <div className={`wrap ${styles.seriesDetailWrap}`}>
            <Link className={styles.backLink} href="/workshops">
              <ArrowLeft size={16} />
              All workshops
            </Link>

            <div className={styles.seriesDetailGrid}>
              <SeriesHeroCopy className={styles.seriesDetailCopy}>
                <div className={styles.seriesDetailBadgeRow}>
                  <WorkshopIconBadge workshop={series} />
                  <span className={`${styles.status} ${styles[series.salesStatus]}`}>
                    {workshopSeriesStatusLabel[series.salesStatus]}
                  </span>
                </div>
                <TypewriterText
                  className={styles.eyebrow}
                  speed={30}
                  text="Complete workshop series"
                />
                <h1>{series.title}</h1>
                <p className={styles.seriesLead}>{series.oneLiner}</p>
                <p className={styles.seriesDescription}>{series.description}</p>

                <div className={styles.seriesOverview} aria-label="Series overview">
                  <div>
                    <Layers3 size={19} />
                    <span>
                      <small>Learning path</small>
                      <strong>{series.workshops.length} guided sessions</strong>
                    </span>
                  </div>
                  <div>
                    <CalendarRange size={19} />
                    <span>
                      <small>Schedule</small>
                      <strong>{getSeriesDateRange(series)}</strong>
                    </span>
                  </div>
                  <div>
                    <CreditCard size={19} />
                    <span>
                      <small>Series pass</small>
                      <strong>{priceLabel}</strong>
                    </span>
                  </div>
                </div>

                <div className={styles.seriesDetailActions}>
                  <a href="#series-curriculum">
                    Explore the learning path <ArrowDown size={15} />
                  </a>
                  <span>
                    <Layers3 size={17} />
                    Every workshop can still be booked separately
                  </span>
                </div>
              </SeriesHeroCopy>

              <SeriesPricePanel
                ariaLabel="Series pricing"
                className={`${styles.seriesPriceCard} ${series.pricingConflict ? styles.seriesPriceCardAlert : ''}`}
              >
                <div className={styles.seriesPriceHeading}>
                  <span>Complete series pass</span>
                  <span>{series.workshops.length} sessions</span>
                </div>
                <strong>{priceLabel}</strong>
                <p className={styles.seriesPriceIntro}>
                  {series.pricingConflict
                    ? 'This series includes a paid workshop. Set a paid series price in Sanity before registration can open.'
                    : series.paymentType === 'paid'
                      ? 'One secure checkout reserves your place across the complete learning path.'
                      : 'Register once to reserve your place across every session in this learning path.'}
                </p>
                {individualTotal && saving > 0 ? (
                  <div className={styles.savingsPanel}>
                    <span>
                      Individually{' '}
                      {formatWorkshopPrice({
                        currency: series.currency,
                        paymentType: 'paid',
                        price: individualTotal,
                      })}
                    </span>
                    <strong>
                      Save{' '}
                      {formatWorkshopPrice({
                        currency: series.currency,
                        paymentType: 'paid',
                        price: saving,
                      })}
                    </strong>
                  </div>
                ) : null}
                {canRegister ? (
                  <Link
                    className={styles.seriesPriceCta}
                    href={`/workshops/series/${series.slug}/register`}
                  >
                    {series.ctaLabel}
                    <ArrowRight size={17} />
                  </Link>
                ) : (
                  <button className={styles.seriesPriceCta} disabled type="button">
                    {series.pricingConflict ? 'Pricing setup required' : 'Registration unavailable'}
                  </button>
                )}
                <span className={styles.seriesPriceAssurance}>
                  <ShieldCheck size={16} />
                  {series.paymentType === 'paid' && !series.pricingConflict
                    ? 'Secure payment powered by Stripe'
                    : 'One registration covers the complete series'}
                </span>
                <ul>
                  <li>
                    <Check size={16} /> One registration for every session
                  </li>
                  <li>
                    <Check size={16} /> Session reminders sent by email
                  </li>
                  <li>
                    <Check size={16} /> Individual workshops remain available separately
                  </li>
                </ul>
              </SeriesPricePanel>
            </div>
          </div>
        </section>

        <section className={`wrap ${styles.seriesCurriculum}`} id="series-curriculum">
          <div className={styles.indexHead}>
            <SeriesCurriculumHead>
              <TypewriterText
                className={styles.eyebrow}
                speed={32}
                text="Your learning path"
              />
              <h2 className={styles.sectionTitle}>What’s included</h2>
              <p className={styles.indexIntro}>
                Take the full sequence or book the sessions that matter most to you.
              </p>
            </SeriesCurriculumHead>
            <span className={styles.resultsMeta}>{series.workshops.length} sessions</span>
          </div>

          <ol className={styles.seriesSessionList}>
            {series.workshops.map((workshop, index) => (
              <SeriesSessionItem index={index} key={workshop._id}>
                <span className={styles.seriesSessionNumber}>{String(index + 1).padStart(2, '0')}</span>
                <div className={styles.seriesSessionMain}>
                  <div className={styles.seriesSessionHeader}>
                    <div>
                      <span className={styles.kicker}>
                        Session {index + 1} · {workshop.format}
                      </span>
                      <h3>{workshop.title}</h3>
                      <p>{workshop.oneLiner}</p>
                    </div>
                  </div>
                  <div className={styles.seriesSessionMeta}>
                    <span>
                      <CalendarDays size={16} />
                      {formatWorkshopDate(workshop.date, { year: 'numeric' })}
                    </span>
                    <span>
                      <Clock3 size={16} />
                      {workshop.time} {workshop.timezone}
                    </span>
                    <span>
                      <Users size={16} />
                      {workshop.spotsLabel}
                    </span>
                    <span>
                      <CreditCard size={16} />
                      {formatWorkshopPrice(workshop)}
                    </span>
                  </div>
                </div>
                <div className={styles.seriesSessionAction}>
                  <span className={`${styles.status} ${styles[workshop.bookingStatus]}`}>
                    {workshopStatusLabel[workshop.bookingStatus]}
                  </span>
                  <Link href={`/workshops/${workshop.slug}/register`}>
                    Reserve a seat <ArrowRight size={15} />
                  </Link>
                </div>
              </SeriesSessionItem>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </div>
  );
}
