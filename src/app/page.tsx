import HeroSection from '@/components/sections/hero-section';
import ProjectsGrid from '@/components/sections/projects-grid';
import VideoSection from '@/components/sections/video-section';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <ProjectsGrid />
          </div>
          <div>
            <VideoSection />
          </div>
        </div>
      </div>
    </div>
  );
}
