
'use client';

import Image from 'next/image';
import Link from 'next/link';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardTitle } from '../ui/card';
import { Calendar, Eye, PlayCircle } from 'lucide-react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Skeleton } from '../ui/skeleton';

type Video = {
    id: string;
    title: string;
    uploadDate: string;
    views: string;
    thumbnailUrl: string;
    thumbnailHint: string;
};

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
                <Link href={`/videos/${video.id}`} key={video.id} className="group">
                    <NeumorphicCard className="group overflow-hidden flex flex-col h-full p-0 transition-all duration-300 hover:-translate-y-1">
                        <div className="relative overflow-hidden">
                        {video.thumbnailUrl && (video.thumbnailUrl.startsWith('http') || video.thumbnailUrl.startsWith('/')) ? (
                            <Image
                                src={video.thumbnailUrl}
                                alt={video.title}
                                width={500}
                                height={350}
                                className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={video.thumbnailHint}
                            />
                        ) : (
                            <div className="w-full h-52 bg-muted flex items-center justify-center">
                                <span className="text-sm text-muted-foreground">Pas de miniature</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PlayCircle className="w-16 h-16 text-white" />
                        </div>
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
                </Link>
            ))}
        </div>
        </section>
    );
}
