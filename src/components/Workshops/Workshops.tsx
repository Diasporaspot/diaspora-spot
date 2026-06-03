'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Clock3,
  FileCheck2,
  FileText,
  Globe2,
  MapPin,
  MessageCircle,
  Presentation,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Button from '@/components/Button/Button';
import type { Workshop, WorkshopIcon, WorkshopIconTone } from '@/content/types';
import styles from './workshops.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const iconMap: Record<WorkshopIcon, LucideIcon> = {
  document: FileText,
  briefcase: Briefcase,
  conversation: MessageCircle,
  people: Users,
  calendar: CalendarDays,
  globe: Globe2,
  target: Target,
  presentation: Presentation,
  checklist: FileCheck2,
  'map-pin': MapPin,
};

const iconClassMap: Record<WorkshopIconTone, string> = {
  warm: styles.iconSand,
  gold: styles.iconMustard,
  dark: styles.iconDark,
  green: styles.iconGreen,
  blue: styles.iconBlue,
};

const statusLabel = {
  'booking-open': 'Booking open',
  'few-spots': 'Few spots left',
  waitlist: 'Waitlist',
};

const formatWorkshopDate = (date: string) =>
  new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

function WorkshopMeta({ workshop }: { workshop: Workshop }) {
  return (
    <div className={styles.metaGrid}>
      <span>
        <CalendarDays size={16} strokeWidth={1.7} />
        {formatWorkshopDate(workshop.date)}
      </span>
      <span>
        <Clock3 size={16} strokeWidth={1.7} />
        {workshop.time} {workshop.timezone}
      </span>
      <span>
        <Users size={16} strokeWidth={1.7} />
        {workshop.spotsLabel}
      </span>
    </div>
  );
}

function WorkshopIcon({ workshop }: { workshop: Workshop }) {
  const Icon = iconMap[workshop.icon];

  return (
    <div className={`${styles.iconWrap} ${iconClassMap[workshop.iconTone]}`}>
      <Icon size={24} strokeWidth={1.6} />
    </div>
  );
}

function Workshops({ workshops }: { workshops: Workshop[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [featuredWorkshop, ...upcomingWorkshops] = workshops;

  if (!featuredWorkshop) return null;

  return (
    <section className={styles.workshops} id="workshops" ref={ref}>
      <div className="wrap">
        <motion.div
          className={styles.head}
          variants={fadeUp}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <span className={styles.eyebrow}>This Season</span>
          <h2 className={styles.title}>Upcoming Professional Workshops.</h2>
          <p className={styles.sub}>
            Hands-on sessions led by professionals to help you move forward in your career.
          </p>
        </motion.div>

        <motion.div
          className={styles.workshopBoard}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          variants={{ animate: { transition: { delayChildren: 0.18, staggerChildren: 0.16 } } }}
        >
          <motion.article
            className={styles.featuredCard}
            variants={{
              initial: { opacity: 0, y: 28, scale: 0.985 },
              animate: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.featuredTop}>
              <WorkshopIcon workshop={featuredWorkshop} />
              <span className={`${styles.status} ${styles[featuredWorkshop.bookingStatus]}`}>
                {statusLabel[featuredWorkshop.bookingStatus]}
              </span>
            </div>

            <div className={styles.featuredContent}>
              <span className={styles.kicker}>Next live session</span>
              <h3 className={styles.featuredTitle}>{featuredWorkshop.title}</h3>
              <p className={styles.oneLiner}>{featuredWorkshop.oneLiner}</p>
              <p className={styles.description}>{featuredWorkshop.description}</p>
            </div>

            <WorkshopMeta workshop={featuredWorkshop} />

            <div className={styles.featuredFooter}>
              <span>
                {featuredWorkshop.format} · {featuredWorkshop.duration}
              </span>
              <Button variant="inverse" href={featuredWorkshop.href}>
                {featuredWorkshop.ctaLabel} <ArrowRight size={14} strokeWidth={2} />
              </Button>
            </div>
          </motion.article>

          <div className={styles.scheduleStack}>
            {upcomingWorkshops.map((workshop, index) => (
              <motion.article
                key={workshop._id}
                className={styles.sessionCard}
                variants={{
                  initial: { opacity: 0, x: 24 },
                  animate: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.sessionIndex}>0{index + 2}</div>
                <div className={styles.sessionBody}>
                  <div className={styles.sessionHead}>
                    <WorkshopIcon workshop={workshop} />
                    <span className={`${styles.status} ${styles[workshop.bookingStatus]}`}>
                      {statusLabel[workshop.bookingStatus]}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{workshop.title}</h3>
                  <p className={styles.sessionDescription}>{workshop.description}</p>
                  <WorkshopMeta workshop={workshop} />
                  <div className={styles.sessionFooter}>
                    <span>
                      Hosted by {workshop.host} · {workshop.duration}
                    </span>
                    <Button variant="ghost" href={workshop.href}>
                      {workshop.ctaLabel} <ArrowRight size={14} strokeWidth={2} />
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.cta}
          variants={fadeUp}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          transition={{ duration: 0.5, delay: 0.36, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <Button variant="primary" href="/workshops">
            View All Workshops <ArrowRight size={14} strokeWidth={2} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default Workshops;
