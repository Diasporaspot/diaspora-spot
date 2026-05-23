export type WorkshopStatus = 'booking-open' | 'few-spots' | 'waitlist';

export type Workshop = {
  id: string;
  title: string;
  oneLiner: string;
  description: string;
  date: string;
  time: string;
  timezone: string;
  duration: string;
  format: string;
  host: string;
  spotsLabel: string;
  status: WorkshopStatus;
  icon: 'cv' | 'interview' | 'portfolio';
  ctaLabel: string;
  href: string;
};

export const workshops: Workshop[] = [
  {
    id: 'cv-review-live',
    title: 'CV Reviews',
    oneLiner: 'Get noticed by recruiters.',
    description:
      'Bring your current CV and leave with clearer positioning, sharper bullets, and practical edits you can use immediately.',
    date: '2026-06-06',
    time: '11:00',
    timezone: 'WAT',
    duration: '60 min',
    format: 'Live online',
    host: 'Career Desk',
    spotsLabel: '18 spots',
    status: 'booking-open',
    icon: 'cv',
    ctaLabel: 'Book CV Review',
    href: '#',
  },
  {
    id: 'interview-prep-live',
    title: 'Interview Preparation',
    oneLiner: 'Walk in ready. Walk out confident.',
    description:
      'Practice stronger answers, structure your stories, and learn how to speak with calm authority in global interviews.',
    date: '2026-06-13',
    time: '14:00',
    timezone: 'WAT',
    duration: '90 min',
    format: 'Live online',
    host: 'Hiring Circle',
    spotsLabel: '9 spots left',
    status: 'few-spots',
    icon: 'interview',
    ctaLabel: 'Reserve Seat',
    href: '#',
  },
  {
    id: 'portfolio-tips-live',
    title: 'Portfolio Tips',
    oneLiner: 'Let your work speak for itself.',
    description:
      'Turn scattered projects into a focused proof-of-work page that makes your value easier to understand.',
    date: '2026-06-20',
    time: '12:00',
    timezone: 'WAT',
    duration: '60 min',
    format: 'Workshop lab',
    host: 'Design Review',
    spotsLabel: 'Waitlist open',
    status: 'waitlist',
    icon: 'portfolio',
    ctaLabel: 'Join Waitlist',
    href: '#',
  },
];
