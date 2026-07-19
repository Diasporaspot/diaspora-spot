export type ContentStatus = 'draft' | 'published' | 'archived';

export type SanityImage = {
  alt: string;
  url: string;
};

export type ContentCategory =
  | 'Career'
  | 'Money'
  | 'Housing'
  | 'Visas'
  | 'Community'
  | 'Culture';

export type ArticleTextSpan = {
  text: string;
  marks?: ('strong' | 'em')[];
  href?: string;
};

export type ArticleBlock =
  | {
      _type: 'heading';
      text: string;
      level?: 2 | 3;
    }
  | {
      _type: 'paragraph';
      text?: string;
      children?: ArticleTextSpan[];
    }
  | {
      _type: 'quote';
      text: string;
      attribution?: string;
    }
  | {
      _type: 'list';
      items: (string | ArticleTextSpan[])[];
    }
  | {
      _type: 'table';
      columns: string[];
      rows: string[][];
    }
  | {
      _type: 'faq';
      items: {
        question: string;
        answer: ArticleTextSpan[];
      }[];
    };

export type Article = {
  _id: string;
  _type: 'article';
  createdAt?: string;
  status: ContentStatus;
  title: string;
  slug: string;
  excerpt: string;
  category: ContentCategory;
  coverImage: SanityImage;
  author: string;
  publishedAt: string;
  readTime: string;
  articleDetails?: string;
  featured: boolean;
  body: ArticleBlock[];
  internalNotes?: string[];
  seo: {
    title: string;
    description: string;
  };
};

export type WorkshopStatus = 'booking-open' | 'few-spots' | 'waitlist';
export type WorkshopPaymentType = 'free' | 'paid';
export type WorkshopSeriesStatus = WorkshopStatus | 'closed';

export type WorkshopIcon =
  | 'document'
  | 'briefcase'
  | 'conversation'
  | 'people'
  | 'calendar'
  | 'globe'
  | 'target'
  | 'presentation'
  | 'checklist'
  | 'map-pin';

export type WorkshopIconTone = 'warm' | 'gold' | 'dark' | 'green' | 'blue';

export type WorkshopSeriesSummary = {
  _id: string;
  title: string;
  slug: string;
};

export type Workshop = {
  _id: string;
  _type: 'workshop';
  createdAt?: string;
  status: ContentStatus;
  title: string;
  slug: string;
  oneLiner: string;
  description: string;
  date: string;
  time: string;
  timezone: string;
  duration: string;
  format: string;
  host: string;
  spotsLabel: string;
  bookingStatus: WorkshopStatus;
  paymentType: WorkshopPaymentType;
  price: number;
  currency: string;
  icon: WorkshopIcon;
  iconTone: WorkshopIconTone;
  ctaLabel: string;
  registrationReady: boolean;
  featured: boolean;
  series?: WorkshopSeriesSummary;
};

export type WorkshopSeries = {
  _id: string;
  _type: 'workshopSeries';
  createdAt?: string;
  status: ContentStatus;
  title: string;
  slug: string;
  oneLiner: string;
  description: string;
  workshops: Workshop[];
  salesStatus: WorkshopSeriesStatus;
  allowWaitlistedWorkshops: boolean;
  paymentType: WorkshopPaymentType;
  price: number;
  currency: string;
  icon: WorkshopIcon;
  iconTone: WorkshopIconTone;
  ctaLabel: string;
  pricingConflict: boolean;
  registrationReady: boolean;
  featured: boolean;
};

export type JobEmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Volunteer';

export type JobLocationType = 'Remote' | 'Hybrid' | 'On-site';

export type JobSeniority = 'Entry level' | 'Mid level' | 'Senior' | 'Lead' | 'Manager';

export type Job = {
  _id: string;
  _type: 'job';
  createdAt?: string;
  status: ContentStatus;
  title: string;
  slug: string;
  department: string;
  location: string;
  locationType: JobLocationType;
  employmentType: JobEmploymentType;
  seniority?: JobSeniority;
  salaryRange?: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  howToApply: string;
  contactEmail?: string;
  postedAt: string;
  applyBy?: string;
  featured: boolean;
};

export type EventStatus = 'registration-open' | 'few-spots' | 'sold-out' | 'waitlist';

export type Event = {
  _id: string;
  _type: 'event';
  status: ContentStatus;
  title: string;
  slug: string;
  summary: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: string;
  eventType: 'Online' | 'In person' | 'Hybrid';
  capacityLabel: string;
  eventStatus: EventStatus;
  coverImage: SanityImage;
  registrationUrl: string;
  featured: boolean;
};

export type GuideType = 'Checklist' | 'Playbook' | 'Template' | 'Country guide' | 'Resource list';

export type GuideStage = 'Getting started' | 'Planning' | 'Actively applying' | 'Settling in';

export type Guide = {
  _id: string;
  _type: 'guide';
  status: ContentStatus;
  title: string;
  slug: string;
  summary: string;
  category: ContentCategory;
  guideType: GuideType;
  stage: GuideStage;
  coverImage: SanityImage;
  readTime: string;
  publishedAt: string;
  ctaLabel: string;
  downloadUrl?: string;
  featured: boolean;
  body: ArticleBlock[];
  seo: {
    title: string;
    description: string;
  };
};
