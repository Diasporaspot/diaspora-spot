import Topbar from '@/components/Topbar/Topbar';
import Hero from '@/components/Hero/Hero';
import Problem from '@/components/Problem/Problem';
import Solution from '@/components/Solution/Solution';
import Articles from '@/components/Articles/Articles';
import Workshops from '@/components/Workshops/Workshops';
import Community from '@/components/Community/Community';
import FinalCta from '@/components/FinalCta/FinalCta';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  return (
    <>
      <Topbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Articles />
        <Workshops />
        <Community />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
