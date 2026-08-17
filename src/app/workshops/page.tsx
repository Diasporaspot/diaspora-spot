import WorkshopsPageContent from './WorkshopsPageContent';

export const metadata = {
  title: 'Workshops | DiasporaSpot',
  description: 'Hands-on professional workshops from DiasporaSpot.',
};

export const dynamic = 'force-dynamic';

type WorkshopsPageProps = {
  searchParams: Promise<{
    view?: string | string[];
  }>;
};

export default async function WorkshopsPage({ searchParams }: WorkshopsPageProps) {
  const { view } = await searchParams;

  return <WorkshopsPageContent initialCatalogView={view === 'sessions' ? 'sessions' : undefined} />;
}
