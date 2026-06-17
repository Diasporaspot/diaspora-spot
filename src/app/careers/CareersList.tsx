'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/Button/Button';
import ContentList, {
  type ContentListFilter,
  type ContentListSort,
} from '@/components/ContentList/ContentList';
import type { Job } from '@/content/types';
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import styles from './careers-page.module.css';

function getDateValue(value?: string) {
  if (!value) return 0;
  const parsedDate = new Date(value.includes('T') ? value : `${value}T00:00:00`);

  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

function formatDate(date?: string) {
  if (!date) return null;

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function getMailto(job: Job) {
  if (!job.contactEmail) return undefined;

  const subject = encodeURIComponent(`Application: ${job.title}`);
  return `mailto:${job.contactEmail}?subject=${subject}`;
}

function JobCard({ job }: { job: Job }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <>
      <article
        aria-label={job.featured ? `${job.title}, priority role` : job.title}
        className={`${styles.card} ${job.featured ? styles.priorityCard : ''}`.trim()}
        id={job.slug || job._id}
      >
        <div className={styles.cardHead}>
          <div className={styles.cardLabelLine}>
            <span className={styles.department}>{job.department}</span>
          </div>
          <span className={styles.postedDate}>Posted {formatDate(job.postedAt) ?? 'recently'}</span>
        </div>

        <div className={styles.cardBody}>
          <h2 className={styles.cardTitle}>{job.title}</h2>
          <p className={styles.summary}>{job.summary}</p>

          <div className={styles.metaGrid}>
            <span>
              <MapPin size={15} />
              {job.location} · {job.locationType}
            </span>
            <span>
              <BriefcaseBusiness size={15} />
              {[job.employmentType, job.seniority].filter(Boolean).join(' · ')}
            </span>
            <span>
              <Building2 size={15} />
              {job.salaryRange || 'Compensation shared during process'}
            </span>
          </div>

          <div className={styles.cardFoot}>
            {job.applyBy ? (
              <span>
                <CalendarDays size={15} />
                Apply by {formatDate(job.applyBy)}
              </span>
            ) : null}
            <Button variant="ghost" onClick={() => setSelectedJob(job)}>
              Read role
            </Button>
          </div>
        </div>
      </article>

      <AnimatePresence>
        {selectedJob ? <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} /> : null}
      </AnimatePresence>
    </>
  );
}

function JobModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const mailto = getMailto(job);
  const deadline = formatDate(job.applyBy);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={styles.modalOverlay}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <motion.section
        animate={{ opacity: 1, scale: 1, y: 0 }}
        aria-labelledby="career-role-title"
        aria-modal="true"
        className={styles.modal}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        role="dialog"
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.modalHead}>
          <div>
            <span className={styles.department}>{job.department}</span>
            <h2 id="career-role-title">{job.title}</h2>
          </div>
          <button aria-label="Close role details" className={styles.closeButton} onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <div className={styles.modalMeta}>
          <span>
            <MapPin size={15} />
            {job.location} · {job.locationType}
          </span>
          <span>
            <BriefcaseBusiness size={15} />
            {[job.employmentType, job.seniority].filter(Boolean).join(' · ')}
          </span>
          <span>
            <Building2 size={15} />
            {job.salaryRange || 'Compensation shared during process'}
          </span>
          {deadline ? (
            <span>
              <CalendarDays size={15} />
              Apply by {deadline}
            </span>
          ) : null}
        </div>

        <div className={styles.modalBody}>
          <div className={styles.details}>
            <section>
              <h3>Role</h3>
              <p>{job.description}</p>
            </section>

            {job.responsibilities.length > 0 ? (
              <section>
                <h3>What you will own</h3>
                <ul>
                  {job.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {job.requirements.length > 0 ? (
              <section>
                <h3>What helps you succeed</h3>
                <ul>
                  {job.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <div className={styles.applyBox}>
            <span className={styles.applyLabel}>How to apply</span>
            <p>{job.howToApply}</p>
            <div className={styles.cardMeta}>
              <span>Posted {formatDate(job.postedAt) ?? 'recently'}</span>
              {deadline ? <span>Apply by {deadline}</span> : null}
            </div>
            {mailto ? (
              <Button variant="ghost" href={mailto}>
                Email application
              </Button>
            ) : null}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

type CareersListProps = {
  departments: string[];
  jobs: Job[];
};

export default function CareersList({ departments, jobs }: CareersListProps) {
  const filters: ContentListFilter<Job>[] = [
    {
      id: 'department',
      label: 'Filter by team',
      icon: <SlidersHorizontal size={16} />,
      options: [
        { label: 'All teams', value: 'all' },
        ...departments.map((department) => ({ label: department, value: department })),
      ],
      predicate: (job, value) => value === 'all' || job.department === value,
    },
    {
      id: 'locationType',
      label: 'Filter by location type',
      icon: <MapPin size={16} />,
      options: [
        { label: 'All locations', value: 'all' },
        { label: 'Remote', value: 'Remote' },
        { label: 'Hybrid', value: 'Hybrid' },
        { label: 'On-site', value: 'On-site' },
      ],
      predicate: (job, value) => value === 'all' || job.locationType === value,
    },
  ];
  const sorts: ContentListSort<Job>[] = [
    {
      label: 'Newest first',
      value: 'newest',
      compare: (a, b) =>
        getDateValue(b.postedAt) - getDateValue(a.postedAt) ||
        getDateValue(b.createdAt) - getDateValue(a.createdAt),
    },
    {
      label: 'Deadline first',
      value: 'deadline',
      compare: (a, b) => {
        const aDeadline = getDateValue(a.applyBy) || Number.MAX_SAFE_INTEGER;
        const bDeadline = getDateValue(b.applyBy) || Number.MAX_SAFE_INTEGER;

        return aDeadline - bDeadline;
      },
    },
    {
      label: 'Alphabetical A-Z',
      value: 'az',
      compare: (a, b) => a.title.localeCompare(b.title),
    },
  ];

  return (
    <ContentList
      ariaLabel="Job list"
      emptyMessage="No roles match those filters."
      filters={filters}
      getSearchText={(job) =>
        [
          job.title,
          job.department,
          job.location,
          job.locationType,
          job.employmentType,
          job.seniority,
          job.summary,
          job.description,
        ].join(' ')
      }
      gridClassName={styles.grid}
      items={jobs}
      pageSize={5}
      renderItem={(job) => <JobCard key={job._id} job={job} />}
      searchPlaceholder="Search open roles"
      sorts={sorts}
    />
  );
}
