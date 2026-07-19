import { sanityClient } from '@/sanity/lib/client';
import { hasSeriesPricingConflict } from '@/lib/workshop-registration-core';
import {
  allPublishedArticlesQuery,
  articleCategoriesQuery,
  articleBySlugQuery,
  articleSlugsQuery,
  allPublishedJobsQuery,
  featuredPublishedArticlesQuery,
  upcomingWorkshopsQuery,
  publishedWorkshopSeriesQuery,
  workshopSeriesBySlugQuery,
} from '@/sanity/lib/queries';
import { articles, events, guides, workshops } from './dummyData';
import type {
  Article,
  ArticleBlock,
  ArticleTextSpan,
  ContentCategory,
  ContentStatus,
  Guide,
  Job,
  JobEmploymentType,
  JobLocationType,
  JobSeniority,
  Workshop,
  WorkshopIcon,
  WorkshopIconTone,
  WorkshopPaymentType,
  WorkshopStatus,
  WorkshopSeries,
  WorkshopSeriesStatus,
  WorkshopSeriesSummary,
} from './types';

type SanityMarkDef = {
  _key?: string;
  _type?: string;
  href?: string;
};

type SanitySpan = {
  _key?: string;
  _type?: string;
  text?: string;
  marks?: string[];
};

type SanityPortableTextBlock = {
  _key?: string;
  _type: 'block';
  style?: string;
  listItem?: string;
  level?: number;
  children?: SanitySpan[];
  markDefs?: SanityMarkDef[];
};

type SanityBodyBlock =
  | SanityPortableTextBlock
  | {
      _type: 'heading';
      text?: string;
      level?: number;
    }
  | {
      _type: 'paragraph';
      text?: string;
      children?: SanityPortableTextBlock[];
    }
  | {
      _type: 'list';
      items?: {
        text?: string;
        children?: SanityPortableTextBlock[];
      }[];
    }
  | {
      _type: 'table';
      columns?: string[];
      rows?: string[][];
    }
  | {
      _type: 'faq';
      items?: {
        question?: string;
        answer?: SanityPortableTextBlock[];
      }[];
    };

type SanityArticle = {
  _id: string;
  _type: 'article';
  _createdAt?: string;
  status?: ContentStatus;
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  coverImage?: {
    url?: string;
    alt?: string;
  };
  author?: string;
  publishedAt?: string;
  readTime?: string;
  articleDetails?: string;
  featured?: boolean;
  seo?: {
    title?: string;
    description?: string;
  };
  internalNotes?: string[];
  body?: SanityBodyBlock[];
};

type ArticleSlug = {
  slug: string;
};

type SanityWorkshop = {
  _id: string;
  _type: 'workshop';
  _createdAt?: string;
  status?: ContentStatus;
  title?: string;
  slug?: string;
  oneLiner?: string;
  description?: string;
  date?: string;
  time?: string;
  timezone?: string;
  duration?: string;
  format?: string;
  host?: string;
  spotsLabel?: string;
  bookingStatus?: WorkshopStatus;
  paymentType?: WorkshopPaymentType;
  price?: number;
  currency?: string;
  icon?: WorkshopIcon;
  iconTone?: WorkshopIconTone;
  ctaLabel?: string;
  registrationReady?: boolean;
  featured?: boolean;
  series?: WorkshopSeriesSummary;
};

type SanityWorkshopSeries = {
  _id: string;
  _type: 'workshopSeries';
  _createdAt?: string;
  status?: ContentStatus;
  title?: string;
  slug?: string;
  oneLiner?: string;
  description?: string;
  workshops?: SanityWorkshop[];
  salesStatus?: WorkshopSeriesStatus;
  allowWaitlistedWorkshops?: boolean;
  paymentType?: WorkshopPaymentType;
  price?: number;
  currency?: string;
  icon?: WorkshopIcon;
  iconTone?: WorkshopIconTone;
  ctaLabel?: string;
  pricingConflict?: boolean;
  registrationReady?: boolean;
  featured?: boolean;
};

type SanityJob = {
  _id: string;
  _type: 'job';
  _createdAt?: string;
  status?: ContentStatus;
  title?: string;
  slug?: string;
  department?: string;
  location?: string;
  locationType?: JobLocationType;
  employmentType?: JobEmploymentType;
  seniority?: JobSeniority;
  salaryRange?: string;
  summary?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  howToApply?: string;
  contactEmail?: string;
  postedAt?: string;
  applyBy?: string;
  featured?: boolean;
};

function byDateAsc<T extends { date: string }>(a: T, b: T) {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

function getDateValue(date?: string) {
  if (!date) {
    return 0;
  }

  const parsedDate = new Date(date).getTime();

  return Number.isNaN(parsedDate) ? 0 : parsedDate;
}

function byArticleDateDesc(a: Article, b: Article) {
  return (
    getDateValue(b.publishedAt) - getDateValue(a.publishedAt) ||
    getDateValue(b.createdAt) - getDateValue(a.createdAt)
  );
}

function getLocalArticles() {
  return articles.filter((article) => article.status === 'published').sort(byArticleDateDesc);
}

function portableTextToSpans(blocks?: SanityPortableTextBlock[]): ArticleTextSpan[] {
  return (
    blocks?.flatMap((block) => {
      const linkMarks = new Map(
        block.markDefs
          ?.filter((markDef) => markDef._key && markDef._type === 'link' && markDef.href)
          .map((markDef) => [markDef._key as string, markDef.href as string]) ?? [],
      );

      return (
        block.children?.map((span) => {
          const marks = span.marks?.filter((mark) => mark === 'strong' || mark === 'em') as
            | ArticleTextSpan['marks']
            | undefined;
          const linkMark = span.marks?.find((mark) => linkMarks.has(mark));

          return {
            text: span.text ?? '',
            ...(marks?.length ? { marks } : {}),
            ...(linkMark ? { href: linkMarks.get(linkMark) } : {}),
          };
        }) ?? []
      );
    }) ?? []
  );
}

function normalizeBody(blocks?: SanityBodyBlock[]): ArticleBlock[] {
  const normalizedBlocks: ArticleBlock[] = [];

  for (const block of blocks ?? []) {
    if (block._type === 'block') {
      const children = portableTextToSpans([block]);

      if (block.listItem) {
        const previousBlock = normalizedBlocks.at(-1);

        if (previousBlock?._type === 'list') {
          previousBlock.items.push(children);
        } else {
          normalizedBlocks.push({
            _type: 'list',
            items: [children],
          });
        }

        continue;
      }

      if (block.style === 'h2' || block.style === 'h3') {
        normalizedBlocks.push({
          _type: 'heading',
          text: children.map((span) => span.text).join(''),
          level: block.style === 'h3' ? 3 : 2,
        });

        continue;
      }

      normalizedBlocks.push({
        _type: 'paragraph',
        children,
      });

      continue;
    }

    if (block._type === 'heading') {
      normalizedBlocks.push({
        _type: 'heading',
        text: block.text ?? '',
        level: block.level === 3 ? 3 : 2,
      });

      continue;
    }

    if (block._type === 'paragraph') {
      const children = portableTextToSpans(block.children);

      normalizedBlocks.push(
        children.length > 0
          ? {
              _type: 'paragraph',
              children,
            }
          : {
              _type: 'paragraph',
              text: block.text ?? '',
            },
      );

      continue;
    }

    if (block._type === 'list') {
      normalizedBlocks.push({
        _type: 'list',
        items:
            block.items?.map((item) => {
              const children = portableTextToSpans(item.children);

              return children.length > 0 ? children : item.text ?? '';
            }) ?? [],
      });

      continue;
    }

    if (block._type === 'table') {
      normalizedBlocks.push({
        _type: 'table',
        columns: block.columns ?? [],
          rows: block.rows ?? [],
      });

      continue;
      }

    normalizedBlocks.push({
      _type: 'faq',
      items:
          block.items?.map((item) => ({
            question: item.question ?? '',
            answer: portableTextToSpans(item.answer),
          })) ?? [],
    });
  }

  return normalizedBlocks;
}

function normalizeArticle(article: SanityArticle): Article {
  return {
    _id: article._id,
    _type: 'article',
    createdAt: article._createdAt,
    status: article.status ?? 'published',
    title: article.title ?? '',
    slug: article.slug ?? '',
    excerpt: article.excerpt ?? '',
    category: (article.category ?? 'Community') as ContentCategory,
    coverImage: {
      url: article.coverImage?.url ?? '',
      alt: article.coverImage?.alt ?? '',
    },
    author: article.author ?? '',
    publishedAt: article.publishedAt ?? '',
    readTime: article.readTime ?? '',
    articleDetails: article.articleDetails ?? '',
    featured: article.featured ?? false,
    seo: {
      title: article.seo?.title ?? article.title ?? '',
      description: article.seo?.description ?? article.excerpt ?? '',
    },
    internalNotes: article.internalNotes,
    body: normalizeBody(article.body),
  };
}

function normalizeWorkshop(workshop: SanityWorkshop): Workshop {
  return {
    _id: workshop._id,
    _type: 'workshop',
    createdAt: workshop._createdAt,
    status: workshop.status ?? 'published',
    title: workshop.title ?? '',
    slug: workshop.slug ?? '',
    oneLiner: workshop.oneLiner ?? '',
    description: workshop.description ?? '',
    date: workshop.date ?? '',
    time: workshop.time ?? '',
    timezone: workshop.timezone ?? '',
    duration: workshop.duration ?? '',
    format: workshop.format ?? '',
    host: workshop.host ?? '',
    spotsLabel: workshop.spotsLabel ?? '',
    bookingStatus: workshop.bookingStatus ?? 'booking-open',
    paymentType: workshop.paymentType ?? 'free',
    price: workshop.price ?? 0,
    currency: workshop.currency ?? 'usd',
    icon: workshop.icon ?? 'document',
    iconTone: workshop.iconTone ?? 'warm',
    ctaLabel: workshop.ctaLabel ?? 'Reserve a seat',
    registrationReady: workshop.registrationReady ?? false,
    featured: workshop.featured ?? false,
    series: workshop.series,
  };
}

function normalizeWorkshopSeries(series: SanityWorkshopSeries): WorkshopSeries {
  const normalizedWorkshops = (series.workshops ?? []).map(normalizeWorkshop);
  const pricingConflict =
    series.pricingConflict ??
    hasSeriesPricingConflict({ paymentType: series.paymentType, workshops: normalizedWorkshops });

  return {
    _id: series._id,
    _type: 'workshopSeries',
    createdAt: series._createdAt,
    status: series.status ?? 'published',
    title: series.title ?? '',
    slug: series.slug ?? '',
    oneLiner: series.oneLiner ?? '',
    description: series.description ?? '',
    workshops: normalizedWorkshops,
    salesStatus: series.salesStatus ?? 'booking-open',
    allowWaitlistedWorkshops: series.allowWaitlistedWorkshops ?? false,
    paymentType: series.paymentType ?? 'free',
    price: series.price ?? 0,
    currency: series.currency ?? 'usd',
    icon: series.icon ?? 'presentation',
    iconTone: series.iconTone ?? 'gold',
    ctaLabel: series.ctaLabel ?? 'Get the complete series',
    pricingConflict,
    registrationReady: (series.registrationReady ?? false) && !pricingConflict,
    featured: series.featured ?? false,
  };
}

function normalizeJob(job: SanityJob): Job {
  return {
    _id: job._id,
    _type: 'job',
    createdAt: job._createdAt,
    status: job.status ?? 'published',
    title: job.title ?? '',
    slug: job.slug ?? '',
    department: job.department ?? 'Team',
    location: job.location ?? 'Remote',
    locationType: job.locationType ?? 'Remote',
    employmentType: job.employmentType ?? 'Full-time',
    seniority: job.seniority,
    salaryRange: job.salaryRange,
    summary: job.summary ?? '',
    description: job.description ?? '',
    responsibilities: job.responsibilities ?? [],
    requirements: job.requirements ?? [],
    howToApply: job.howToApply ?? '',
    contactEmail: job.contactEmail,
    postedAt: job.postedAt ?? '',
    applyBy: job.applyBy,
    featured: job.featured ?? false,
  };
}

async function fetchSanityArticles(query: string, params: Record<string, string> = {}) {
  try {
    const sanityArticles = await sanityClient.fetch<SanityArticle[]>(query, params, {
      cache: 'no-store',
    });

    return sanityArticles.map(normalizeArticle);
  } catch (error) {
    console.warn('Sanity article fetch failed, falling back to local dummy data.', error);
    return [];
  }
}

async function fetchSanityArticleBySlug(slug: string) {
  try {
    const article = await sanityClient.fetch<SanityArticle | null>(
      articleBySlugQuery,
      { slug },
      { cache: 'no-store' },
    );

    return article ? normalizeArticle(article) : null;
  } catch (error) {
    console.warn('Sanity article fetch failed, falling back to local dummy data.', error);
    return null;
  }
}

export async function getFeaturedArticles(limit = 4) {
  const sanityArticles = await fetchSanityArticles(featuredPublishedArticlesQuery);
  const sourceArticles =
    sanityArticles.length > 0
      ? sanityArticles
      : getLocalArticles().filter((article) => article.featured);

  return sourceArticles.slice(0, limit);
}

export async function getHomepageArticles() {
  const sourceArticles = await getAllArticles();
  const featuredArticle = sourceArticles.find((article) => article.featured) ?? sourceArticles[0];
  const recentArticles = sourceArticles
    .filter((article) => article._id !== featuredArticle?._id)
    .slice(0, 2);

  return featuredArticle ? [featuredArticle, ...recentArticles] : recentArticles;
}

export async function getAllArticles() {
  const sanityArticles = await fetchSanityArticles(allPublishedArticlesQuery);

  return sanityArticles.length > 0 ? sanityArticles : getLocalArticles();
}

export async function getArticleCategories() {
  try {
    const categories = await sanityClient.fetch<string[]>(articleCategoriesQuery, {}, {
      cache: 'no-store',
    });

    if (categories.length > 0) {
      return categories.filter(Boolean).sort((a, b) => a.localeCompare(b));
    }
  } catch (error) {
    console.warn('Sanity article category fetch failed.', error);
  }

  return Array.from(new Set(getLocalArticles().map((article) => article.category))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export async function getArticleBySlug(slug: string) {
  const sanityArticle = await fetchSanityArticleBySlug(slug);

  return sanityArticle ?? getLocalArticles().find((article) => article.slug === slug) ?? null;
}

export async function getArticleSlugs() {
  try {
    const sanitySlugs = await sanityClient.fetch<ArticleSlug[]>(articleSlugsQuery, {}, {
      cache: 'no-store',
    });

    if (sanitySlugs.length > 0) {
      return sanitySlugs;
    }
  } catch (error) {
    console.warn('Sanity article slug fetch failed.', error);
  }

  return getLocalArticles().map((article) => ({ slug: article.slug }));
}

export async function getUpcomingWorkshops() {
  try {
    const sanityWorkshops = await sanityClient.fetch<SanityWorkshop[]>(
      upcomingWorkshopsQuery,
      {},
      { cache: 'no-store' },
    );

    return sanityWorkshops.map(normalizeWorkshop);
  } catch (error) {
    console.warn('Sanity workshop fetch failed, falling back to local dummy data.', error);
  }

  return workshops.filter((workshop) => workshop.status === 'published').sort(byDateAsc);
}

export async function getPublishedWorkshopSeries() {
  try {
    const series = await sanityClient.fetch<SanityWorkshopSeries[]>(
      publishedWorkshopSeriesQuery,
      {},
      { cache: 'no-store' },
    );

    return series.map(normalizeWorkshopSeries);
  } catch (error) {
    console.warn('Sanity workshop series fetch failed.', error);
    return [];
  }
}

export async function getWorkshopSeriesBySlug(slug: string) {
  try {
    const series = await sanityClient.fetch<SanityWorkshopSeries | null>(
      workshopSeriesBySlugQuery,
      { slug },
      { cache: 'no-store' },
    );

    return series ? normalizeWorkshopSeries(series) : null;
  } catch (error) {
    console.warn('Sanity workshop series fetch failed.', error);
    return null;
  }
}

export async function getAllJobs() {
  try {
    const sanityJobs = await sanityClient.fetch<SanityJob[]>(
      allPublishedJobsQuery,
      {},
      { cache: 'no-store' },
    );

    return sanityJobs.map(normalizeJob);
  } catch (error) {
    console.warn('Sanity job fetch failed.', error);
  }

  return [];
}

export async function getUpcomingEvents() {
  return events.filter((event) => event.status === 'published').sort(byDateAsc);
}

export async function getAllGuides() {
  return guides
    .filter((guide) => guide.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getGuideCategories() {
  const categories = new Set(
    guides.filter((guide) => guide.status === 'published').map((guide) => guide.category),
  );

  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

export async function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.status === 'published' && guide.slug === slug) ?? null;
}

export async function getGuideSlugs() {
  return guides
    .filter((guide) => guide.status === 'published')
    .map((guide: Guide) => ({
      slug: guide.slug,
    }));
}
