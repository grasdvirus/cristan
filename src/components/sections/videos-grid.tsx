import Image from 'next/image';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardTitle } from '../ui/card';
import { PlayCircle } from 'lucide-react';

export default function VideosGrid() {
  // Let's reuse some project images for videos for now.
  const videoThumbnails = PlaceHolderImages.filter((img) =>
    img.id.startsWith('project-')
  ).slice(0, 2);

  return (
    <section id="videos" className="w-full">
      <h2 className="text-3xl font-bold font-headline mb-12 text-center">
        Mes Vidéos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {videoThumbnails.map((video, index) => (
          <NeumorphicCard key={video.id} className="group overflow-hidden cursor-pointer">
             <div className="relative overflow-hidden rounded-lg mb-4">
              <Image
                src={video.imageUrl}
                alt={video.description}
                width={500}
                height={350}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={video.imageHint}
              />
               <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PlayCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            <CardTitle className="font-headline text-lg">
              Vidéo {index + 1}
            </CardTitle>
          </NeumorphicCard>
        ))}
      </div>
    </section>
  );
}
