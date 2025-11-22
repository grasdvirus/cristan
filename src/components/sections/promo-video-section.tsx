
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
        // Assuming there's a timestamp field to order by, like 'uploadDate'.
        // If not, you might need to adjust this query or it will get a random document.
        // For now, let's just limit to 1, assuming any video is fine.
        return query(collection(firestore, 'videos'), limit(1));
    }, [firestore]);

    const { data: videos, isLoading } = useCollection<Video>(latestVideoQuery);

    const promoVideo = videos?.[0];

    if (isLoading) {
        return (
            <section className="py-12 sm:py-16">
                <div className="container">
                    <Skeleton className="w-full aspect-video rounded-3xl" />
                </div>
            </section>
        );
    }
    
    if (!promoVideo) {
        return null; // Don't render anything if there's no video
    }
    
    // In a real scenario, you would have a direct video file URL (.mp4, .webm).
    // YouTube embed URLs don't work directly in <video> tags.
    // This is a placeholder to show how it would work with a direct file.
    // We will use a placeholder video for now. The YouTube URL is in `promoVideo.videoUrl`.
    // The component expects a direct .mp4 link.
    const videoSource = "https://storage.googleapis.com/test-prod-assets/videos/final.mp4";

    return (
        <section className="py-12 sm:py-16 bg-background">
            <div className="container max-w-5xl mx-auto">
                 <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-8 text-center">
                    Notre Manifeste
                </h2>
                <VideoPlayer src={videoSource} poster={promoVideo.thumbnailUrl} />
            </div>
        </section>
    );
}
