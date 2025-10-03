
import Image from 'next/image';
import Link from 'next/link';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { videosData } from '@/lib/videos-data';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardTitle } from '../ui/card';
import { Calendar, Eye, PlayCircle } from 'lucide-react';

export default function VideosGrid() {

  const getVideoThumbnail = (thumbnailId: string) => {
    return PlaceHolderImages.find((img) => img.id === thumbnailId);
  }

  return (
    <section id="videos" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videosData.map((video) => {
          const thumbnail = getVideoThumbnail(video.thumbnailId);
          if (!thumbnail) return null;

          return (
            <Link href={`/videos/${video.id}`} key={video.id} className="group">
              <NeumorphicCard className="overflow-hidden cursor-pointer flex flex-col h-full">
                 <div className="relative overflow-hidden rounded-lg mb-4">
                  <Image
                    src={thumbnail.imageUrl}
                    alt={thumbnail.description}
                    width={500}
                    height={350}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={thumbnail.imageHint}
                  />
                   <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="flex flex-col flex-grow">
                  <CardTitle className="font-headline text-lg mb-2">
                    {video.title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground mt-auto gap-4">
                      <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4'/>
                          <span>{video.uploadDate}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                          <Eye className='w-4 h-4'/>
                          <span>{video.views}</span>
                      </div>
                  </div>
                </div>
              </NeumorphicCard>
            </Link>
          )
        })}
      </div>
    </section>
  );
}
