import WorkshopsPageContent from './WorkshopsPageContent';

export const metadata = {
  title: 'Workshops | DiasporaSpot',
  description: 'Hands-on professional workshops from DiasporaSpot.',
};

export const dynamic = 'force-dynamic';

export default async function WorkshopsPage() {
  return <WorkshopsPageContent />;
}
