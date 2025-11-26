'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardTitle } from '../ui/card';
import { Calendar, Eye, PlayCircle } from 'lucide-react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { convertToEmbedUrl } from '@/lib/utils';

type Video = {
    id: string;
    title: string;
    uploadDate: string;
    views: string;
    thumbnailUrl: string;
    thumbnailHint: string;
    videoUrl: string;
};

function VideoCard({ video }: { video: Video }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const embedUrl = isPlaying ? `${convertToEmbedUrl(video.videoUrl)}?autoplay=1&modestbranding=1&controls=1&rel=0&playsinline=1` : '';

    return (
        <NeumorphicCard className="group overflow-hidden flex flex-col h-full p-0 transition-all duration-300 hover:-translate-y-1">
            <div className="relative overflow-hidden aspect-video">
                {isPlaying ? (
                     <iframe
                        src={embedUrl}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                ) : (
                    <>
                    {video.thumbnailUrl && (video.thumbnailUrl.startsWith('http') || video.thumbnailUrl.startsWith('/')) ? (
                        <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={video.thumbnailHint}
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">Pas de miniature</span>
                        </div>
                    )}
                    <div 
                        className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => setIsPlaying(true)}
                    >
                        <PlayCircle className="w-16 h-16 text-white" />
                    </div>
                    </>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <CardTitle className="font-headline text-xl mb-3 leading-tight">
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
    )
}

function VideoGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
                <NeumorphicCard key={i} className="p-0 flex flex-col">
                    <Skeleton className="h-52 w-full" />
                    <div className="p-6 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                </NeumorphicCard>
            ))}
        </div>
    );
}

export function HomeTVSection() {
  const { firestore } = useFirebase();
  const videosQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'videos')) : null, [firestore]);
  const { data: videos, isLoading } = useCollection<Video>(videosQuery);
  const autoplay = React.useRef(
      Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const validVideos = videos?.filter(video => video.thumbnailUrl);

  if (isLoading) {
      return <Skeleton className="h-64 w-full" />;
  }

  if (!validVideos || validVideos.length === 0) {
      return null;
  }

  return (
    <NeumorphicCard className="p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1">
                <h3 className="text-2xl sm:text-3xl font-bold font-headline mb-4">Programme TV</h3>
                <p className="text-muted-foreground mb-6">
                    Découvrez nos dernières émissions, tutoriels et analyses. Plongez dans un univers de contenu tech et créatif.
                </p>
                <Button asChild size="lg" className="w-full sm:w-auto btn-neumorphic-light dark:btn-neumorphic-dark">
                    <a href="https://tristan-del.vercel.app/decouvrir" target="_blank" rel="noopener noreferrer">
                        Suivre le programme
                    </a>
                </Button>
            </div>
            <div className="lg:col-span-2">
                <Carousel
                    className="w-full"
                    plugins={[autoplay.current]}
                    opts={{
                        loop: true,
                        align: 'start',
                    }}
                >
                    <CarouselContent className="-ml-4">
                        {validVideos.map((video) => (
                            <CarouselItem key={video.id} className="pl-4 basis-1/2 md:basis-1/3">
                                <NeumorphicCard inset className="overflow-hidden">
                                     <Image
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        width={300}
                                        height={170}
                                        className="w-full h-auto object-cover aspect-video"
                                    />
                                </NeumorphicCard>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
    </NeumorphicCard>
  );
}

export default function VideosGrid() {
    const { firestore } = useFirebase();
    const videosQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'videos')) : null, [firestore]);
    const { data: videos, isLoading } = useCollection<Video>(videosQuery);
    
    if (isLoading) {
        return <VideoGridSkeleton />;
    }

    if (!videos || videos.length === 0) {
        return <p className="text-center text-muted-foreground">Aucune vidéo trouvée pour le moment.</p>;
    }

    return (
        <section id="videos" className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        </section>
    );
}
