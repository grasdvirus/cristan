
'use client';

import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { VideoPlayer } from '../video-player';
import { Skeleton } from '../ui/skeleton';

type Video = {
    id: string;
    videoUrl: string;
    thumbnailUrl: string;
};

export function PromoVideoSection() {
    const { firestore } = useFirebase();
    const PROMO_VIDEO_ID = 'promo-video';

    const promoVideoRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'videos', PROMO_VIDEO_ID);
    }, [firestore]);

    const { data: promoVideo, isLoading } = useDoc<Video>(promoVideoRef);

    if (isLoading) {
        return (
            <section className="py-12 sm:py-16">
                <div className="container px-4">
                    <Skeleton className="w-full aspect-video rounded-3xl" />
                </div>
            </section>
        );
    }
    
    if (!promoVideo || !promoVideo.videoUrl) {
        return null; // Ne rien rendre si la vidéo n'est pas configurée
    }

    return (
        <section className="py-12 sm:py-16 bg-background">
            <div className="container px-4">
                <VideoPlayer src={promoVideo.videoUrl} poster={promoVideo.thumbnailUrl} />
            </div>
        </section>
    );
}
