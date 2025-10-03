
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { videosData, Video } from '@/lib/videos-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';

export default function VideoDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const video = videosData.find((v) => v.id === id) as (Omit<Video, 'views'> & { views: string | number });
  const otherVideos = videosData.filter((v) => v.id !== id);

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Vidéo non trouvée</h1>
        <p className="text-muted-foreground mt-2">
          La vidéo que vous cherchez n'existe pas ou a été déplacée.
        </p>
         <Link href="/" passHref>
            <Button variant="outline" className="mt-8">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
            </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
       <div className="mb-8">
            <Button 
                variant="ghost" 
                onClick={() => router.push('/#videos')} 
                className="btn-neumorphic-light dark:btn-neumorphic-dark"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
            </Button>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
            {/* Video Player */}
             <div className="aspect-video w-full">
              <iframe
                src={video.videoUrl}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-2xl neumorphic-card-inset-light dark:neumorphic-card-inset-dark"
              ></iframe>
            </div>

            {/* Video Info */}
            <NeumorphicCard className="w-full mt-8">
            <div className="">
              <h1 className="text-3xl font-bold font-headline">{video.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground mt-2 gap-4">
                  <div className='flex items-center gap-2'>
                      <Calendar className='w-4 h-4'/>
                      <span>{video.uploadDate}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                      <Eye className='w-4 h-4'/>
                      <span>{video.views}</span>
                  </div>
              </div>
              <Separator className="my-6" />
              <div>
                <h2 className="text-xl font-bold font-headline mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{video.description}</p>
              </div>
            </div>
          </NeumorphicCard>
        </div>

        {/* Suggested Videos */}
        <div className="lg:col-span-1">
          <NeumorphicCard>
            <h2 className="text-2xl font-bold font-headline mb-4">À suivre</h2>
            <div className="flex flex-col gap-4">
              {otherVideos.map((suggVideo) => {
                const thumbnail = PlaceHolderImages.find(img => img.id === suggVideo.thumbnailId);
                return (
                  <Link href={`/videos/${suggVideo.id}`} key={suggVideo.id} className="group">
                    <NeumorphicCard 
                        className="p-3 flex items-start gap-4 hover:scale-[1.02] transition-transform duration-200"
                    >
                      {thumbnail && (
                        <div className="w-2/5 shrink-0">
                            <NeumorphicCard inset className="overflow-hidden">
                                <Image
                                    src={thumbnail.imageUrl}
                                    alt={thumbnail.description}
                                    width={160}
                                    height={90}
                                    className="w-full h-auto object-cover"
                                    data-ai-hint={thumbnail.imageHint}
                                />
                            </NeumorphicCard>
                        </div>
                      )}
                      <div className="w-3/5">
                        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                          {suggVideo.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{suggVideo.views}</p>
                      </div>
                    </NeumorphicCard>
                  </Link>
                );
              })}
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </div>
  );
}
