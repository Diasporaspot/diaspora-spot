import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  CalendarDays,
  CalendarRange,
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
import { getWorkshopSeriesPricingComparison } from '@/lib/workshop-series-pricing';
import {
  SeriesCurriculumHead,
  SeriesHeroCopy,
  SeriesPricePanel,
  SeriesSessionItem,
} from '../SeriesMotion';
import {
  formatCurrencyAmount,
  formatWorkshopDate,
  formatWorkshopPrice,
  formatWorkshopSeriesPrice,
  WorkshopIconBadge,
  workshopSeriesStatusLabel,
  workshopStatusLabel,
} from '../../workshopShared';
import styles from '../../workshops-page.module.css';

export const dynamic = 'force-dynamic';

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

  const pricing = getWorkshopSeriesPricingComparison(series);
  const priceLabel = formatWorkshopSeriesPrice(series);
  const individualStartingPrice = pricing.individualStartingPrice
    ? pricing.individualStartingPrice.paymentType === 'free'
      ? formatCurrencyAmount(series.currency, 0)
      : formatWorkshopPrice(pricing.individualStartingPrice)
    : null;
  const perSessionPrice =
    pricing.perSessionPrice !== null
      ? formatWorkshopPrice({
          currency: series.currency,
          paymentType: 'paid',
          price: pricing.perSessionPrice,
        })
      : null;
  const saving =
    pricing.saving > 0
      ? formatWorkshopPrice({
          currency: series.currency,
          paymentType: 'paid',
          price: pricing.saving,
        })
      : null;
  const individualTotal =
    pricing.individualTotal !== null
      ? formatWorkshopPrice({
          currency: series.currency,
          paymentType: 'paid',
          price: pricing.individualTotal,
        })
      : null;
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
                      <small>Flexible booking</small>
                      <strong>
                        {individualStartingPrice
                          ? `From ${individualStartingPrice} or full series`
                          : 'Single sessions or full series'}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className={styles.seriesDetailActions}>
                  <a href="#series-curriculum">
                    Choose an individual workshop <ArrowDown size={15} />
                  </a>
                  <span>
                    <Layers3 size={17} />
                    Or reserve the complete series in one checkout
                  </span>
                </div>
              </SeriesHeroCopy>

              <SeriesPricePanel
                ariaLabel="Series pricing"
                className={`${styles.seriesPriceCard} ${series.pricingConflict ? styles.seriesPriceCardAlert : ''}`}
              >
                <div className={styles.seriesPriceHeading}>
                  <span>Choose how you’d like to join</span>
                  <span>{series.workshops.length} sessions</span>
                </div>
                <p className={styles.seriesPriceIntro}>
                  {series.pricingConflict
                    ? 'This series includes a paid workshop. Set a paid series price in Sanity before registration can open.'
                    : 'Start with the workshop that matters now, or take the complete learning path for the best overall value.'}
                </p>

                <div className={styles.seriesPricingChoices}>
                  <a className={styles.seriesPricingChoice} href="#series-curriculum">
                    <span className={styles.seriesPricingChoiceTop}>
                      <span>Book one workshop</span>
                      <em>Lowest commitment</em>
                    </span>
                    <strong>
                      {individualStartingPrice ? `From ${individualStartingPrice}` : 'Choose below'}
                    </strong>
                    <p>Pick only the session that is most useful to you right now.</p>
                    <span className={styles.seriesPricingChoiceLink}>
                      View individual workshops <ArrowDown size={14} />
                    </span>
                  </a>

                  <div
                    className={`${styles.seriesPricingChoice} ${styles.seriesPricingChoiceFeatured}`}
                  >
                    <span className={styles.seriesPricingChoiceTop}>
                      <span>Complete series</span>
                      <em>{saving ? 'Best value' : 'Complete path'}</em>
                    </span>
                    <div className={styles.seriesBundlePrice}>
                      <strong>{priceLabel}</strong>
                      <span>{perSessionPrice ? `${perSessionPrice} per session` : 'All sessions included'}</span>
                    </div>
                    {saving && individualTotal ? (
                      <p className={styles.seriesSavingLine}>
                        <span>{individualTotal} booked separately</span>
                        <strong>Save {saving}</strong>
                      </p>
                    ) : (
                      <p>One registration reserves your place across the complete learning path.</p>
                    )}

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
                        {series.pricingConflict
                          ? 'Pricing setup required'
                          : 'Registration unavailable'}
                      </button>
                    )}
                  </div>
                </div>

                <span className={styles.seriesPriceAssurance}>
                  <ShieldCheck size={16} />
                  {series.paymentType === 'paid' && !series.pricingConflict
                    ? 'Secure payment powered by Stripe'
                    : 'One registration covers the complete series'}
                </span>
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
