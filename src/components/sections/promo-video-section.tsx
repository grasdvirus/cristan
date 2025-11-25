
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import { VideoPlayer } from '../video-player';

type PromoVideo = {
    id: string;
    title: string;
    videoUrl: string;
};

export function PromoVideoSection() {
    const { firestore } = useFirebase();
    const promoVideosQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'promoVideos'));
    }, [firestore]);

    const { data: promoVideos, isLoading } = useCollection<PromoVideo>(promoVideosQuery);
    
    const autoplayPlugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false })
    );
    const fadePlugin = React.useRef(Fade({
        transitionDuration: 1000
    }));

    if (isLoading) {
        return (
            <section className="py-12 sm:py-16">
                <div className="container px-4">
                    <Skeleton className="w-full aspect-video rounded-3xl" />
                </div>
            </section>
        );
    }
    
    if (!promoVideos || promoVideos.length === 0) {
        return null; // Ne rien rendre si aucune vidéo n'est configurée
    }

    return (
        <section className="py-12 sm:py-16 bg-background">
            <div className="container px-4">
                 <Carousel
                    className="w-full"
                    plugins={[autoplayPlugin.current, fadePlugin.current]}
                    opts={{
                        loop: true,
                    }}
                >
                    <CarouselContent>
                        {promoVideos.map((video) => (
                            <CarouselItem key={video.id}>
                                <VideoPlayer src={video.videoUrl} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
}
