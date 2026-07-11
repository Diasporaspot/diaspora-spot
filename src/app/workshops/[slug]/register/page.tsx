import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, CreditCard, Users } from 'lucide-react';
import Topbar from '@/components/Topbar/Topbar';
import Footer from '@/components/Footer/Footer';
import { getUpcomingWorkshops } from '@/content/queries';
import type { Workshop } from '@/content/types';
import { getStripe } from '@/lib/stripe';
import {
  formatWorkshopPrice,
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
  searchParams?: Promise<{
    payment?: string;
    session_id?: string;
  }>;
};

type PaymentNotice = 'cancelled' | 'success' | 'unconfirmed';

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
          <CreditCard size={17} />
          <small>Price</small>
          <strong>{formatWorkshopPrice(workshop)}</strong>
        </span>
      </div>
      <div className={styles.registrationHost}>
        <span>Hosted by</span>
        <strong>
          {workshop.host} · {workshop.duration}
        </strong>
      </div>
    </aside>
  );
}

async function getPaymentNotice({
  searchParams,
  workshop,
}: {
  searchParams?: { payment?: string; session_id?: string };
  workshop: Workshop;
}): Promise<PaymentNotice | undefined> {
  if (searchParams?.payment === 'cancelled') {
    return 'cancelled';
  }

  if (searchParams?.payment !== 'success' || workshop.paymentType !== 'paid') {
    return undefined;
  }

  const sessionId = searchParams.session_id;

  if (!sessionId || sessionId === '{CHECKOUT_SESSION_ID}') {
    return 'unconfirmed';
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const sessionMatchesWorkshop =
      session.client_reference_id === workshop._id && session.metadata?.slug === workshop.slug;

    return session.payment_status === 'paid' && sessionMatchesWorkshop
      ? 'success'
      : 'unconfirmed';
  } catch (reason) {
    console.error('Could not verify Stripe checkout session.', reason);
    return 'unconfirmed';
  }
}

export default async function WorkshopRegistrationPage({
  params,
  searchParams,
}: WorkshopRegistrationPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const workshops = await getUpcomingWorkshops();
  const workshop = workshops.find((item) => item.slug === slug);

  if (!workshop) {
    notFound();
  }

  const priceLabel = formatWorkshopPrice(workshop);
  const paymentNotice = await getPaymentNotice({
    searchParams: resolvedSearchParams,
    workshop,
  });

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
                  {workshop.paymentType === 'paid'
                    ? `Enter your details below, then complete the ${priceLabel} payment securely through Stripe.`
                    : 'Enter your details below. The team will use your email to send confirmation, reminders, and workshop updates.'}
                </p>

                {workshop.registrationReady ? (
                  <WorkshopRegistrationForm
                    initialNotice={paymentNotice}
                    isPaid={workshop.paymentType === 'paid'}
                    priceLabel={priceLabel}
                    slug={workshop.slug}
                  />
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
