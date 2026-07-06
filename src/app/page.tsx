import Topbar from '@/components/Topbar/Topbar';
import Hero from '@/components/Hero/Hero';
import Problem from '@/components/Problem/Problem';
import Solution from '@/components/Solution/Solution';
import Articles from '@/components/Articles/Articles';
import Workshops from '@/components/Workshops/Workshops';
import Community from '@/components/Community/Community';
import FinalCta from '@/components/FinalCta/FinalCta';
import Footer from '@/components/Footer/Footer';
import HomeAccessPrompt from '@/components/HomeAccessPrompt/HomeAccessPrompt';
import { getHomepageArticles, getUpcomingWorkshops } from '@/content/queries';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [articles, workshops] = await Promise.all([
    getHomepageArticles(),
    getUpcomingWorkshops(),
  ]);

  return (
    <>
      <Topbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Articles articles={articles} />
        <Workshops workshops={workshops} />
        <Community />
        <FinalCta />
      </main>
      <Footer />
      <HomeAccessPrompt />
    </>
  );
}
