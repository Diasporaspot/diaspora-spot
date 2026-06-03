import WorkshopsPageContent from '../WorkshopsPageContent';

export const dynamic = 'force-dynamic';

type WorkshopDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function WorkshopDetailPage({ params }: WorkshopDetailPageProps) {
  const { slug } = await params;

  return <WorkshopsPageContent activeWorkshopSlug={slug} />;
}
