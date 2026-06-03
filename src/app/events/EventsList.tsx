'use client';

import Button from '@/components/Button/Button';
import ContentList, {
  type ContentListFilter,
  type ContentListSort,
} from '@/components/ContentList/ContentList';
import type { Event } from '@/content/types';
import { SlidersHorizontal } from 'lucide-react';
import styles from './events-page.module.css';

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

function EventCard({ event }: { event: Event }) {
  const mediaStyle = event.coverImage.url
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(43,38,34,0) 50%, rgba(43,38,34,0.36) 100%), url(${event.coverImage.url})`,
      }
    : undefined;

  return (
    <article className={styles.card}>
      <div className={styles.media} style={mediaStyle}>
        <span className={`${styles.status} ${styles[event.eventStatus]}`}>
          {statusLabel[event.eventStatus]}
        </span>
      </div>
      <div className={styles.body}>
        <span className={styles.kicker}>{event.eventType}</span>
        <h2 className={styles.cardTitle}>{event.title}</h2>
        <p className={styles.description}>{event.summary}</p>
        <div className={styles.meta}>
          <span>
            {formatDate(event.date)} · {event.startTime}-{event.endTime} {event.timezone}
          </span>
          <span>{event.location}</span>
          <span>{event.capacityLabel}</span>
        </div>
        <Button variant="ghost" href={event.registrationUrl}>
          Register interest
        </Button>
      </div>
    </article>
  );
}

export default function EventsList({ events }: { events: Event[] }) {
  const filters: ContentListFilter<Event>[] = [
    {
      id: 'type',
      label: 'Filter by format',
      icon: <SlidersHorizontal size={16} />,
      options: [
        { label: 'All formats', value: 'all' },
        { label: 'Online', value: 'Online' },
        { label: 'In person', value: 'In person' },
        { label: 'Hybrid', value: 'Hybrid' },
      ],
      predicate: (event, value) => value === 'all' || event.eventType === value,
    },
  ];
  const sorts: ContentListSort<Event>[] = [
    {
      label: 'Soonest first',
      value: 'soonest',
      compare: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      label: 'Alphabetical A-Z',
      value: 'az',
      compare: (a, b) => a.title.localeCompare(b.title),
    },
  ];

  return (
    <ContentList
      ariaLabel="Event list"
      emptyMessage="No events match those filters."
      filters={filters}
      getSearchText={(event) =>
        [event.title, event.summary, event.eventType, event.location].join(' ')
      }
      gridClassName={styles.grid}
      items={events}
      pageSize={6}
      renderItem={(event) => <EventCard key={event._id} event={event} />}
      searchPlaceholder="Search events"
      sorts={sorts}
    />
  );
}
