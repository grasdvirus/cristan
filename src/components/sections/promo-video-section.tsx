
'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { VideoPlayer } from '../video-player';
import { Skeleton } from '../ui/skeleton';
import { convertToEmbedUrl } from '@/lib/utils';
import { NeumorphicCard } from '../neumorphic-card';

type Video = {
    id: string;
    videoUrl: string;
    thumbnailUrl: string;
};

export function PromoVideoSection() {
    const { firestore } = useFirebase();
    
    // Fetch only the latest video
    const latestVideoQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'videos'), limit(1));
    }, [firestore]);

    const { data: videos, isLoading } = useCollection<Video>(latestVideoQuery);

    const promoVideo = videos?.[0];

    if (isLoading) {
        return (
            <section className="py-12 sm:py-16">
                <div className="container px-4">
                    <Skeleton className="w-full aspect-video rounded-3xl" />
                </div>
            </section>
        );
    }
    
    if (!promoVideo) {
        return null; // Don't render anything if there's no video
    }
    
    const videoSource = "https://storage.googleapis.com/test-prod-assets/videos/final.mp4";

    return (
        <section className="py-12 sm:py-16 bg-background">
            <div className="container px-4">
                <VideoPlayer src={videoSource} poster={promoVideo.thumbnailUrl} />
            </div>
        </section>
    );
}
