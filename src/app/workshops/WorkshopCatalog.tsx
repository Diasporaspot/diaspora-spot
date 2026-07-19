'use client';

import { LayoutGroup, motion } from 'framer-motion';
import { CalendarDays, Layers3 } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import type { Workshop, WorkshopSeries } from '@/content/types';
import WorkshopExplorer from './WorkshopExplorer';
import WorkshopSeriesShowcase from './WorkshopSeriesShowcase';
import styles from './workshops-page.module.css';

type CatalogView = 'sessions' | 'series';

export default function WorkshopCatalog({
  series,
  workshops,
}: {
  series: WorkshopSeries[];
  workshops: Workshop[];
}) {
  const hasSeries = series.length > 0;
  const [activeView, setActiveView] = useState<CatalogView>(hasSeries ? 'series' : 'sessions');
  const visibleView = hasSeries ? activeView : 'sessions';

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextView =
      event.key === 'ArrowLeft' || event.key === 'Home' ? 'series' : 'sessions';
    setActiveView(nextView);
    window.requestAnimationFrame(() => {
      document.getElementById(`workshop-${nextView}-tab`)?.focus();
    });
  }

  return (
    <section className={`wrap ${styles.workshopCatalog}`} aria-label="Workshop catalogue">
      {hasSeries ? (
        <LayoutGroup id="workshop-catalog-tabs">
          <div className={styles.catalogTabs} role="tablist" aria-label="Browse workshops">
            <button
              aria-controls="workshop-series-panel"
              aria-selected={visibleView === 'series'}
              className={`${styles.catalogTab} ${
                visibleView === 'series' ? styles.catalogTabActive : ''
              }`}
              id="workshop-series-tab"
              onKeyDown={handleTabKey}
              onClick={() => setActiveView('series')}
              role="tab"
              tabIndex={visibleView === 'series' ? 0 : -1}
              type="button"
            >
              <Layers3 size={18} strokeWidth={1.8} />
              <span>Workshop series</span>
              <span className={styles.catalogTabCount}>{series.length}</span>
              {visibleView === 'series' ? (
                <motion.span
                  className={styles.catalogTabIndicator}
                  layoutId="workshop-catalog-active-line"
                  transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                />
              ) : null}
            </button>
            <button
              aria-controls="workshop-sessions-panel"
              aria-selected={visibleView === 'sessions'}
              className={`${styles.catalogTab} ${
                visibleView === 'sessions' ? styles.catalogTabActive : ''
              }`}
              id="workshop-sessions-tab"
              onKeyDown={handleTabKey}
              onClick={() => setActiveView('sessions')}
              role="tab"
              tabIndex={visibleView === 'sessions' ? 0 : -1}
              type="button"
            >
              <CalendarDays size={18} strokeWidth={1.8} />
              <span>Upcoming sessions</span>
              <span className={styles.catalogTabCount}>{workshops.length}</span>
              {visibleView === 'sessions' ? (
                <motion.span
                  className={styles.catalogTabIndicator}
                  layoutId="workshop-catalog-active-line"
                  transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                />
              ) : null}
            </button>
          </div>
        </LayoutGroup>
      ) : null}

      <div
        aria-labelledby={hasSeries ? `workshop-${visibleView}-tab` : undefined}
        className={styles.catalogPanel}
        id={`workshop-${visibleView}-panel`}
        role={hasSeries ? 'tabpanel' : undefined}
      >
        {visibleView === 'series' ? (
          <WorkshopSeriesShowcase series={series} />
        ) : (
          <WorkshopExplorer workshops={workshops} />
        )}
      </div>
    </section>
  );
}
