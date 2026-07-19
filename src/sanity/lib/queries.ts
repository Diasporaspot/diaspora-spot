const articleProjection = `{
  _id,
  _type,
  "_createdAt": _createdAt,
  status,
  title,
  "slug": slug.current,
  excerpt,
  category,
  "coverImage": {
    "url": coverImage.asset->url,
    "alt": coverImage.alt
  },
  author,
  publishedAt,
  readTime,
  articleDetails,
  featured,
  seo,
  internalNotes,
  "body": body[]{
    ...,
    _type == "table" => {
      _type,
      columns,
      "rows": rows[].cells
    }
  }
}`;

export const allPublishedArticlesQuery = `*[_type == "article" && status == "published"] | order(publishedAt desc, _createdAt desc) ${articleProjection}`;

export const featuredPublishedArticlesQuery = `*[_type == "article" && status == "published" && featured == true] | order(publishedAt desc, _createdAt desc) ${articleProjection}`;

export const articleBySlugQuery = `*[_type == "article" && status == "published" && slug.current == $slug][0] ${articleProjection}`;

export const articleSlugsQuery = `*[_type == "article" && status == "published" && defined(slug.current)] | order(publishedAt desc, _createdAt desc) {
  "slug": slug.current
}`;

export const articleCategoriesQuery = `array::unique(*[_type == "article" && status == "published" && defined(category)].category)`;

const workshopFields = `
  _id,
  _type,
  "_createdAt": _createdAt,
  status,
  title,
  "slug": slug.current,
  oneLiner,
  description,
  date,
  time,
  timezone,
  duration,
  format,
  host,
  spotsLabel,
  bookingStatus,
  paymentType,
  price,
  currency,
  icon,
  iconTone,
  ctaLabel,
  "registrationReady": defined(mailerLiteGroupId) && mailerLiteProvisioningStatus == "ready",
  featured`;

const workshopProjection = `{
  ${workshopFields},
  "series": *[
    _type == "workshopSeries" &&
    status == "published" &&
    ^._id in workshops[]._ref
  ][0]{
    _id,
    title,
    "slug": slug.current
  }
}`;

const workshopSeriesProjection = `{
  _id,
  _type,
  "_createdAt": _createdAt,
  status,
  title,
  "slug": slug.current,
  oneLiner,
  description,
  salesStatus,
  allowWaitlistedWorkshops,
  paymentType,
  price,
  currency,
  icon,
  iconTone,
  ctaLabel,
  "pricingConflict":
    paymentType != "paid" &&
    count(workshops[@->status == "published" && @->paymentType == "paid"]) > 0,
  "registrationReady":
    defined(mailerLiteGroupId) &&
    mailerLiteProvisioningStatus == "ready" &&
    count(workshops[@->status == "published"]) > 0 &&
    count(workshops[
      @->status == "published" &&
      (!defined(@->mailerLiteGroupId) || @->mailerLiteProvisioningStatus != "ready")
    ]) == 0 &&
    (
      allowWaitlistedWorkshops == true ||
      count(workshops[@->status == "published" && @->bookingStatus == "waitlist"]) == 0
    ) &&
    (
      paymentType == "paid" ||
      count(workshops[@->status == "published" && @->paymentType == "paid"]) == 0
    ),
  featured,
  "workshops": workshops[@->status == "published"][]->{${workshopFields}}
}`;

export const upcomingWorkshopsQuery = `*[_type == "workshop" && status == "published"] | order(featured desc, date asc) ${workshopProjection}`;

export const featuredWorkshopsQuery = `*[_type == "workshop" && status == "published" && featured == true] | order(date asc) ${workshopProjection}`;

export const publishedWorkshopSeriesQuery = `*[_type == "workshopSeries" && status == "published"] | order(featured desc, _createdAt desc) ${workshopSeriesProjection}`;

export const workshopSeriesBySlugQuery = `*[_type == "workshopSeries" && status == "published" && slug.current == $slug][0] ${workshopSeriesProjection}`;

const jobProjection = `{
  _id,
  _type,
  "_createdAt": _createdAt,
  status,
  title,
  "slug": slug.current,
  department,
  location,
  locationType,
  employmentType,
  seniority,
  salaryRange,
  summary,
  description,
  responsibilities,
  requirements,
  howToApply,
  contactEmail,
  postedAt,
  applyBy,
  featured
}`;

export const allPublishedJobsQuery = `*[_type == "job" && status == "published"] | order(featured desc, postedAt desc, _createdAt desc) ${jobProjection}`;
