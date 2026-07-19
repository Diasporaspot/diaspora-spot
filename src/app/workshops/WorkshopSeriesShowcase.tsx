'use client';

import Link from 'next/link';
import { ArrowRight, CalendarRange, Layers3 } from 'lucide-react';
import ContentList, { type ContentListSort } from '@/components/ContentList/ContentList';
import type { WorkshopSeries } from '@/content/types';
import {
  formatWorkshopDate,
  formatWorkshopPrice,
  formatWorkshopSeriesPrice,
  WorkshopIconBadge,
  workshopSeriesStatusLabel,
} from './workshopShared';
import styles from './workshops-page.module.css';

const seriesSorts: ContentListSort<WorkshopSeries>[] = [
  {
    label: 'Featured first',
    value: 'featured',
    compare: (a, b) => Number(b.featured) - Number(a.featured),
  },
  {
    label: 'Recently added',
    value: 'recent',
    compare: (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  },
  {
    label: 'Alphabetical A-Z',
    value: 'az',
    compare: (a, b) => a.title.localeCompare(b.title),
  },
];

function getDateRange(series: WorkshopSeries) {
  const dates = series.workshops.map((workshop) => workshop.date).filter(Boolean).sort();

  if (!dates.length) {
    return 'Dates to be announced';
  }

  const firstDate = formatWorkshopDate(dates[0], { year: 'numeric' });
  const lastDate = formatWorkshopDate(dates.at(-1) ?? dates[0], { year: 'numeric' });

  return firstDate === lastDate ? firstDate : `${firstDate} – ${lastDate}`;
}

function getSeriesSaving(series: WorkshopSeries) {
  if (series.paymentType !== 'paid' || series.pricingConflict) {
    return '';
  }

  const comparableWorkshops = series.workshops.filter(
    (workshop) => workshop.paymentType === 'paid' && workshop.currency === series.currency,
  );
  const individualTotal = comparableWorkshops.reduce((total, workshop) => total + workshop.price, 0);
  const saving = individualTotal - series.price;

  if (comparableWorkshops.length !== series.workshops.length || saving <= 0) {
    return '';
  }

  return `Save ${formatWorkshopPrice({
    currency: series.currency,
    paymentType: 'paid',
    price: saving,
  })}`;
}

export default function WorkshopSeriesShowcase({ series }: { series: WorkshopSeries[] }) {
  if (!series.length) {
    return null;
  }

  return (
    <section className={styles.seriesSection} aria-labelledby="series-heading">
      <div className={styles.seriesShelfHead}>
        <div>
          <span className={styles.eyebrow}>Learn in sequence</span>
          <h2 className={styles.sectionTitle} id="series-heading">
            Workshop series
          </h2>
          <p className={styles.indexIntro}>
            Choose a guided sequence of workshops and book the complete learning path in one place.
          </p>
        </div>
      </div>

      {series.length > 6 ? (
        <ContentList
          ariaLabel="Workshop series list"
          emptyMessage="No workshop series match that search."
          getSearchText={(item) =>
            [
              item.title,
              item.oneLiner,
              item.description,
              ...item.workshops.map((workshop) => workshop.title),
            ].join(' ')
          }
          gridClassName={styles.seriesGrid}
          items={series}
          pageSize={6}
          renderItem={(item) => <SeriesCard item={item} key={item._id} />}
          searchPlaceholder="Search workshop series"
          sorts={seriesSorts}
        />
      ) : (
        <div className={styles.seriesGrid} aria-label="Workshop series list">
          {series.map((item) => (
            <SeriesCard item={item} key={item._id} />
          ))}
        </div>
      )}
    </section>
  );
}

function SeriesCard({ item }: { item: WorkshopSeries }) {
  const saving = getSeriesSaving(item);

  return (
    <Link className={styles.seriesCard} href={`/workshops/series/${item.slug}`}>
      <div className={styles.seriesCardTop}>
        <WorkshopIconBadge workshop={item} />
        <span className={`${styles.status} ${styles[item.salesStatus]}`}>
          {workshopSeriesStatusLabel[item.salesStatus]}
        </span>
      </div>
      <div className={styles.seriesCardBody}>
        <span className={styles.kicker}>Complete series</span>
        <h3>{item.title}</h3>
        <p>{item.oneLiner}</p>
        <div className={styles.seriesFacts}>
          <span>
            <Layers3 size={16} />
            {item.workshops.length} workshops
          </span>
          <span>
            <CalendarRange size={16} />
            {getDateRange(item)}
          </span>
        </div>
      </div>
      <div className={styles.seriesCardFooter}>
        <div>
          <small>Series pass</small>
          <strong>{formatWorkshopSeriesPrice(item)}</strong>
          {saving ? <span>{saving}</span> : null}
        </div>
        <span className={styles.seriesArrow}>
          View series <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
