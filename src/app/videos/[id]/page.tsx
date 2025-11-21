'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Eye, PlayCircle } from 'lucide-react';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import React, { useState } from 'react';

export type Video = {
    id: string;
    title: string;
    uploadDate: string;
    views: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    thumbnailHint: string;
};


export default function VideoDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { firestore } = useFirebase();
  const [isPlaying, setIsPlaying] = useState(false);


  const videoRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'videos', id);
  }, [firestore, id]);
  const { data: video, isLoading: isVideoLoading } = useDoc<Video>(videoRef);

  const otherVideosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'));
  }, [firestore]);
  const { data: allVideos, isLoading: areVideosLoading } = useCollection<Video>(otherVideosQuery);

  const otherVideos = allVideos?.filter(v => v.id !== id);

  if (isVideoLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <NeumorphicCard className="w-full mt-8 p-4 sm:p-6">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-20 w-full" />
            </NeumorphicCard>
          </div>
          <div className="lg:col-span-1">
            <NeumorphicCard className="p-4 sm:p-6">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </NeumorphicCard>
          </div>
        </div>
      </div>
    );
  }


  if (!video) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Vidéo non trouvée</h1>
        <p className="text-muted-foreground mt-2">
          La vidéo que vous cherchez n'existe pas ou a été déplacée.
        </p>
         <Link href="/tv" passHref>
            <Button variant="outline" className="mt-8">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux vidéos
            </Button>
        </Link>
      </div>
    );
  }

  const handlePlay = () => {
    setIsPlaying(true);
  };
  
  const embedUrl = `${video.videoUrl}?autoplay=1&modestbranding=1&controls=1&rel=0&playsinline=1`;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
       <div className="mb-8">
            <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                size="icon"
                aria-label="Retour"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
            {/* Video Player */}
             <div className="group aspect-video w-full relative rounded-2xl overflow-hidden neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
              {isPlaying ? (
                  <div className="w-full h-full relative">
                    <iframe
                        src={embedUrl}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                    {/* Overlay to block clicks on the top part (title) of the video */}
                    <div className="absolute top-0 left-0 right-0 h-[50px]"></div>
                    {/* Overlay to block clicks on the bottom right (youtube logo) of the video */}
                    <div className="absolute bottom-0 right-0 w-[100px] h-[40px]"></div>
                  </div>
              ) : (
                <>
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                    data-ai-hint={video.thumbnailHint}
                  />
                  <div 
                    className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                    onClick={handlePlay}
                  >
                    <PlayCircle className="w-20 h-20 text-white/80 group-hover:scale-110 group-hover:text-white transition-all duration-300" />
                  </div>
                </>
              )}
            </div>

            {/* Video Info */}
            <NeumorphicCard className="w-full mt-8 p-4 sm:p-6">
            <div className="">
              <h1 className="text-2xl sm:text-3xl font-bold font-headline">{video.title}</h1>
              <div className="flex items-center flex-wrap text-sm text-muted-foreground mt-2 gap-4">
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
          <NeumorphicCard className="p-4 sm:p-6">
            <h2 className="text-2xl font-bold font-headline mb-4">À suivre</h2>
            <div className="flex flex-col gap-4">
              {areVideosLoading && (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
              )}
              {otherVideos?.map((suggVideo) => {
                return (
                  <Link href={`/videos/${suggVideo.id}`} key={suggVideo.id} className="group">
                    <NeumorphicCard 
                        className="p-3 flex items-start gap-4 hover:scale-[1.02] transition-transform duration-200"
                    >
                        <div className="w-2/5 shrink-0">
                            <NeumorphicCard inset className="overflow-hidden">
                               {suggVideo.thumbnailUrl && (suggVideo.thumbnailUrl.startsWith('http') || suggVideo.thumbnailUrl.startsWith('/')) ? (
                                    <Image
                                        src={suggVideo.thumbnailUrl}
                                        alt={suggVideo.title}
                                        width={160}
                                        height={90}
                                        className="w-full h-auto object-cover"
                                        data-ai-hint={suggVideo.thumbnailHint}
                                    />
                                 ) : (
                                    <div className="w-full h-[70px] bg-muted flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground">Pas de miniature</span>
                                    </div>
                                )}
                            </NeumorphicCard>
                        </div>
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
