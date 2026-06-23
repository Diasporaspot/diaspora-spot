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

const workshopProjection = `{
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
  icon,
  iconTone,
  ctaLabel,
  "registrationReady": defined(mailerLiteGroupId) && mailerLiteProvisioningStatus == "ready",
  featured
}`;

export const upcomingWorkshopsQuery = `*[_type == "workshop" && status == "published"] | order(featured desc, date asc) ${workshopProjection}`;

export const featuredWorkshopsQuery = `*[_type == "workshop" && status == "published" && featured == true] | order(date asc) ${workshopProjection}`;

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
