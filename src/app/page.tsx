import HeroSection from '@/components/sections/hero-section';
import ProjectsGrid from '@/components/sections/projects-grid';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <ProjectsGrid />
      </div>
    </div>
  );
}
