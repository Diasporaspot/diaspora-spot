export type SiteEnvironment = 'production' | 'staging';

type EnvironmentInput = {
  nodeEnvironment?: string;
  siteEnvironment?: string;
  vercelEnvironment?: string;
};

export function resolveSiteEnvironment({
  nodeEnvironment,
  siteEnvironment,
  vercelEnvironment,
}: EnvironmentInput): SiteEnvironment {
  if (siteEnvironment === 'production' || siteEnvironment === 'staging') {
    return siteEnvironment;
  }

  if (vercelEnvironment === 'preview' || vercelEnvironment === 'development') {
    return 'staging';
  }

  if (vercelEnvironment === 'production') {
    return 'production';
  }

  return nodeEnvironment === 'development' || nodeEnvironment === 'test'
    ? 'staging'
    : 'production';
}

export function getSiteEnvironment(): SiteEnvironment {
  return resolveSiteEnvironment({
    nodeEnvironment: process.env.NODE_ENV,
    siteEnvironment: process.env.SITE_ENV,
    vercelEnvironment: process.env.VERCEL_ENV,
  });
}

export function getVisibleContentStatuses() {
  return getSiteEnvironment() === 'staging'
    ? (['staging', 'published'] as const)
    : (['published'] as const);
}

export function getVisibleArticleStatuses() {
  return getVisibleContentStatuses();
}

export function getVisibleWorkshopStatuses() {
  return getVisibleContentStatuses();
}

export function getVisibleJobStatuses() {
  return getVisibleContentStatuses();
}

export function isProductionEnvironment() {
  return getSiteEnvironment() === 'production';
}
