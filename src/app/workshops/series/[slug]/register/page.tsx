import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarRange, CreditCard, Layers3 } from 'lucide-react';
import Footer from '@/components/Footer/Footer';
import Topbar from '@/components/Topbar/Topbar';
import { getWorkshopSeriesBySlug } from '@/content/queries';
import type { WorkshopSeries } from '@/content/types';
import { getStripe } from '@/lib/stripe';
import WorkshopRegistrationForm from '../../../[slug]/register/WorkshopRegistrationForm';
import {
  formatWorkshopDate,
  formatWorkshopSeriesPrice,
  WorkshopIconBadge,
  workshopSeriesStatusLabel,
} from '../../../workshopShared';
import styles from '../../../workshops-page.module.css';

export const dynamic = 'force-dynamic';

type PaymentNotice = 'cancelled' | 'success' | 'unconfirmed';

async function getPaymentNotice({
  searchParams,
  series,
}: {
  searchParams?: { payment?: string; session_id?: string };
  series: WorkshopSeries;
}): Promise<PaymentNotice | undefined> {
  if (searchParams?.payment === 'cancelled') {
    return 'cancelled';
  }

  if (searchParams?.payment !== 'success' || series.paymentType !== 'paid') {
    return undefined;
  }

  const sessionId = searchParams.session_id;

  if (!sessionId || sessionId === '{CHECKOUT_SESSION_ID}') {
    return 'unconfirmed';
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const matchesSeries =
      session.metadata?.productId === series._id &&
      session.metadata?.productType === 'series' &&
      session.metadata?.slug === series.slug;

    return session.payment_status === 'paid' && matchesSeries ? 'success' : 'unconfirmed';
  } catch (reason) {
    console.error('Could not verify Stripe series checkout session.', reason);
    return 'unconfirmed';
  }
}

function SeriesSummary({ series }: { series: WorkshopSeries }) {
  const dates = series.workshops.map((workshop) => workshop.date).filter(Boolean).sort();
  const firstDate = dates[0] ? formatWorkshopDate(dates[0], { year: 'numeric' }) : 'TBA';
  const lastDate = dates.at(-1)
    ? formatWorkshopDate(dates.at(-1) ?? dates[0], { year: 'numeric' })
    : 'TBA';

  return (
    <aside className={styles.registrationSummary} aria-label="Series summary">
      <div className={styles.registrationSummaryTop}>
        <WorkshopIconBadge workshop={series} />
        <span className={`${styles.status} ${styles[series.salesStatus]}`}>
          {workshopSeriesStatusLabel[series.salesStatus]}
        </span>
      </div>
      <div>
        <span className={styles.kicker}>Complete series</span>
        <h2>{series.title}</h2>
        <p>{series.oneLiner}</p>
      </div>
      <div className={styles.registrationSummaryGrid}>
        <span>
          <Layers3 size={17} />
          <small>Sessions</small>
          <strong>{series.workshops.length} workshops</strong>
        </span>
        <span>
          <CreditCard size={17} />
          <small>Series price</small>
          <strong>{formatWorkshopSeriesPrice(series)}</strong>
        </span>
      </div>
      <div className={styles.registrationHost}>
        <CalendarRange size={17} />
        <span>Series dates</span>
        <strong>{firstDate === lastDate ? firstDate : `${firstDate} – ${lastDate}`}</strong>
      </div>
    </aside>
  );
}

export default async function WorkshopSeriesRegistrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ payment?: string; session_id?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const series = await getWorkshopSeriesBySlug(slug);

  if (!series) {
    notFound();
  }

  const paymentNotice = await getPaymentNotice({
    searchParams: resolvedSearchParams,
    series,
  });
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
        <section className={styles.registrationPage}>
          <div className={`wrap ${styles.registrationWrap}`}>
            <Link className={styles.backLink} href={`/workshops/series/${series.slug}`}>
              <ArrowLeft size={16} />
              Back to series details
            </Link>

            <div className={styles.registrationLayout}>
              <section className={styles.registrationCard} aria-labelledby="registration-title">
                <span className={styles.eyebrow}>Series registration</span>
                <h1 id="registration-title">Get the complete series</h1>
                <p>
                  {series.paymentType === 'paid'
                    ? `Enter your details, then complete the ${priceLabel} payment securely through Stripe. One purchase registers you for every workshop in the series.`
                    : 'Enter your details once to register for every workshop in this series.'}
                </p>

                {canRegister ? (
                  <WorkshopRegistrationForm
                    initialNotice={paymentNotice}
                    isPaid={series.paymentType === 'paid'}
                    priceLabel={priceLabel}
                    productLabel="series"
                    productType="series"
                    slug={series.slug}
                  />
                ) : (
                  <div className={styles.registrationUnavailable} role="status">
                    <strong>Series registration is unavailable.</strong>
                    <span>
                      {series.pricingConflict
                        ? 'This series includes a paid workshop and needs a paid series price before registration can open.'
                        : 'Registration may be closed, or one of the included sessions is not ready yet.'}
                    </span>
                  </div>
                )}
              </section>

              <SeriesSummary series={series} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
