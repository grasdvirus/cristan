import HeroSection from '@/components/sections/hero-section';
import ProjectsGrid from '@/components/sections/projects-grid';
import VideoSection from '@/components/sections/video-section';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4 py-16 sm:py-24 space-y-24">
        <ProjectsGrid />
        <VideoSection />
      </div>
    </div>
  );
}
