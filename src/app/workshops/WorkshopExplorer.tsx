'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  Clock3,
  Copy,
  CreditCard,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import ContentList, {
  type ContentListFilter,
  type ContentListSort,
} from '@/components/ContentList/ContentList';
import type { Workshop, WorkshopStatus } from '@/content/types';
import {
  formatWorkshopDate,
  formatWorkshopPrice,
  WorkshopIconBadge,
  workshopStatusLabel,
} from './workshopShared';
import styles from './workshops-page.module.css';

const statusOptions: { value: 'all' | WorkshopStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'booking-open', label: 'Booking open' },
  { value: 'few-spots', label: 'Few spots left' },
  { value: 'waitlist', label: 'Waitlist' },
];

function getDateValue(value?: string) {
  if (!value) return 0;
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

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

function WorkshopCard({
  onOpen,
  workshop,
}: {
  onOpen: (workshop: Workshop) => void;
  workshop: Workshop;
}) {
  return (
    <a
      className={styles.card}
      href={`/workshops/${workshop.slug}`}
      onClick={(event) => {
        event.preventDefault();
        onOpen(workshop);
      }}
    >
      <div className={styles.cardTop}>
        <WorkshopIconBadge workshop={workshop} />
        <span className={`${styles.status} ${styles[workshop.bookingStatus]}`}>
          {workshopStatusLabel[workshop.bookingStatus]}
        </span>
      </div>
      <div className={styles.body}>
        <span className={styles.kicker}>{workshop.format}</span>
        <h2 className={styles.cardTitle}>{workshop.title}</h2>
        <p className={styles.description}>{workshop.description}</p>
        <WorkshopMeta workshop={workshop} />
        <div className={styles.cardFooter}>
          <span>
            Hosted by {workshop.host} · {workshop.duration}
          </span>
          <span className={styles.cardAction}>{workshop.ctaLabel}</span>
        </div>
      </div>
    </a>
  );
}

function WorkshopModal({
  copied,
  onClose,
  onCopy,
  workshop,
}: {
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
  workshop: Workshop;
}) {
  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      <button
        aria-label="Close workshop details"
        className={styles.modalBackdrop}
        type="button"
        onClick={onClose}
      />
      <motion.section
        aria-labelledby="workshop-modal-title"
        aria-modal="true"
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        role="dialog"
        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.modalTop}>
          <div className={styles.modalBadgeRow}>
            <WorkshopIconBadge workshop={workshop} />
            <span className={`${styles.status} ${styles[workshop.bookingStatus]}`}>
              {workshopStatusLabel[workshop.bookingStatus]}
            </span>
          </div>
          <button
            aria-label="Close workshop details"
            className={styles.closeButton}
            type="button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalLayout}>
          <div className={styles.modalBody}>
            <span className={styles.kicker}>{workshop.format}</span>
            <h2 id="workshop-modal-title" className={styles.modalTitle}>
              {workshop.title}
            </h2>
            <p className={styles.modalOneLiner}>{workshop.oneLiner}</p>
            <p className={styles.modalDescription}>{workshop.description}</p>

            <div className={styles.hostPanel}>
              <span>Hosted by</span>
              <strong>{workshop.host}</strong>
            </div>
          </div>

          <aside className={styles.bookingPanel} aria-label="Booking details">
            <div className={styles.bookingPanelHead}>
              <span>Session details</span>
              <strong>{workshopStatusLabel[workshop.bookingStatus]}</strong>
            </div>
            <div className={styles.modalMetaGrid}>
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

            <div className={styles.modalActions}>
              {workshop.registrationReady ? (
                <Link
                  className={styles.registrationButton}
                  href={`/workshops/${workshop.slug}/register`}
                >
                  {workshop.ctaLabel}
                </Link>
              ) : (
                <button
                  className={styles.registrationButton}
                  disabled
                  type="button"
                >
                  Registration opening soon
                </button>
              )}
              <button className={styles.copyButton} type="button" onClick={onCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied link' : 'Copy share link'}
              </button>
            </div>
          </aside>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default function WorkshopExplorer({ workshops }: { workshops: Workshop[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const selectedSlug = pathname.match(/^\/workshops\/([^/]+)$/)?.[1];
  const selectedWorkshop = selectedSlug
    ? workshops.find((workshop) => workshop.slug === decodeURIComponent(selectedSlug))
    : undefined;

  const filters = useMemo<ContentListFilter<Workshop>[]>(
    () => [
      {
        id: 'status',
        label: 'Filter by status',
        icon: <SlidersHorizontal size={16} />,
        options: statusOptions,
        predicate: (workshop, value) => value === 'all' || workshop.bookingStatus === value,
      },
    ],
    [],
  );

  const sorts = useMemo<ContentListSort<Workshop>[]>(
    () => [
      {
        label: 'Recently added',
        value: 'recent',
        compare: (a, b) => getDateValue(b.createdAt) - getDateValue(a.createdAt),
      },
      {
        label: 'Soonest first',
        value: 'soonest',
        compare: (a, b) => getDateValue(a.date) - getDateValue(b.date),
      },
      {
        label: 'Alphabetical A-Z',
        value: 'az',
        compare: (a, b) => a.title.localeCompare(b.title),
      },
      {
        label: 'Alphabetical Z-A',
        value: 'za',
        compare: (a, b) => b.title.localeCompare(a.title),
      },
    ],
    [],
  );

  function openWorkshop(workshop: Workshop) {
    router.push(`/workshops/${workshop.slug}`, { scroll: false });
  }

  function closeWorkshop() {
    router.replace('/workshops', { scroll: false });
  }

  function copyWorkshopLink() {
    void navigator.clipboard.writeText(window.location.href).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className={`wrap ${styles.index}`} aria-label="All workshops">
      <div className={styles.indexHead}>
        <div>
          <h2 className={styles.sectionTitle}>Upcoming sessions</h2>
          <p className={styles.indexIntro}>
            Search the workshop library, filter by status, and open a shareable detail view for the
            session you want to send around.
          </p>
        </div>
        <span className={styles.resultsMeta}>{workshops.length} sessions</span>
      </div>

      <ContentList
        ariaLabel="Workshop list"
        emptyMessage="No workshops match those filters."
        filters={filters}
        getSearchText={(workshop) =>
          [
            workshop.title,
            workshop.oneLiner,
            workshop.description,
            workshop.host,
            workshop.format,
          ].join(' ')
        }
        gridClassName={styles.grid}
        items={workshops}
        pageSize={6}
        renderItem={(workshop) => (
          <WorkshopCard key={workshop._id} workshop={workshop} onOpen={openWorkshop} />
        )}
        searchPlaceholder="Search workshops"
        sorts={sorts}
      />

      {workshops.length === 0 ? <p className={styles.empty}>No published workshops yet.</p> : null}

      <AnimatePresence>
        {selectedWorkshop ? (
          <WorkshopModal
            key={selectedWorkshop._id}
            copied={copied}
            onClose={closeWorkshop}
            onCopy={copyWorkshopLink}
            workshop={selectedWorkshop}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
