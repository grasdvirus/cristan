
"use client";

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import React from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Skeleton } from '../ui/skeleton';

type Slide = {
    id: string;
    description: string;
    mediaUrl: string;
    imageHint: string;
    mediaType?: 'image' | 'video';
    videoUrl?: string;
};

export default function HeroSection() {
    const { firestore } = useFirebase();
    const slidesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'slides')) : null, [firestore]);
    const { data: heroItems, isLoading } = useCollection<Slide>(slidesQuery);

    const autoplay = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false })
    );

    if (isLoading) {
        return (
            <section className="relative w-full h-[60vh] md:h-[80vh]">
                <Skeleton className="w-full h-full" />
            </section>
        )
    }

    if (!heroItems || heroItems.length === 0) {
        return (
        <section className="relative w-full h-[60vh] md:h-[80vh] bg-muted flex items-center justify-center">
            <p>Aucun slide trouvé.</p>
        </section>
        );
    }

    return (
        <section className="relative w-full h-[60vh] md:h-[80vh] bg-background overflow-hidden">
        <Carousel
            className="w-full h-full"
            plugins={[autoplay.current, Fade()]}
            opts={{
            loop: true,
            }}
        >
            <CarouselContent className="h-full">
            {heroItems.map((item, index) => (
                <CarouselItem key={item.id} className="h-full">
                <div className="w-full h-full relative">
                    {item.mediaType === 'video' && item.videoUrl ? (
                         <video
                            src={item.videoUrl}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster={item.mediaUrl}
                        />
                    ) : (
                        <Image
                            src={item.mediaUrl}
                            alt={item.description}
                            fill
                            className="object-cover"
                            data-ai-hint={item.imageHint}
                            priority={index === 0}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-end justify-start text-white">
                    <div className="container p-8 md:p-12">
                        <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight drop-shadow-lg">
                        {item.description}
                        </h2>
                    </div>
                    </div>
                </div>
                </CarouselItem>
            ))}
            </CarouselContent>
        </Carousel>
        </section>
    );
}
