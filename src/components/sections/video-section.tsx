import VideoInteraction from '@/components/video-interaction';
import { NeumorphicCard } from '@/components/neumorphic-card';

export default function VideoSection() {
  return (
    <section id="videos" className="w-full">
      <h2 className="text-3xl font-bold font-headline mb-8 text-center lg:text-left">Vidéo</h2>
      <NeumorphicCard>
        <div className="aspect-video mb-4 overflow-hidden rounded-lg neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <VideoInteraction />
      </NeumorphicCard>
    </section>
  );
}
