import VideoInteraction from '@/components/video-interaction';
import { NeumorphicCard } from '@/components/neumorphic-card';

export default function VideoSection() {
  const videos = [
    { id: 1, videoId: 'dQw4w9WgXcQ' },
    { id: 2, videoId: '3tmd-ClpJxA' },
  ];

  return (
    <section id="videos" className="w-full">
      <h2 className="text-3xl font-bold font-headline mb-8 text-center">
        Vidéos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videos.map((video) => (
          <NeumorphicCard key={video.id}>
            <div className="aspect-video mb-4 overflow-hidden rounded-lg neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <VideoInteraction />
          </NeumorphicCard>
        ))}
      </div>
    </section>
  );
}
