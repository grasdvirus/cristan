
"use client";

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Skeleton } from '../ui/skeleton';

type Slide = {
    id: string;
    description: string;
    mediaUrl: string;
    imageHint?: string;
    mediaType?: 'image' | 'video';
    videoUrl?: string;
};

export default function HeroSection() {
    const { firestore } = useFirebase();
    const slidesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'slides')) : null, [firestore]);
    const { data: heroItems, isLoading } = useCollection<Slide>(slidesQuery);

    const [api, setApi] = useState<CarouselApi>();
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    const autoplayPlugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
    );

    const handleSelect = useCallback(() => {
        if (!api || !heroItems) return;
    
        const selectedIndex = api.selectedScrollSnap();
    
        // Pause all videos
        videoRefs.current.forEach((videoEl) => {
            if (videoEl && !videoEl.paused) {
                videoEl.pause();
            }
        });
    
        const currentSlide = heroItems[selectedIndex];
        const currentVideo = videoRefs.current[selectedIndex];
        
        if (currentSlide?.mediaType === 'video' && currentVideo) {
            autoplayPlugin.current.stop(); // Stop autoplay for video
            currentVideo.currentTime = 0;
            const playPromise = currentVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Autoplay was prevented, which is common. User interaction is needed.
                    console.error("Video play failed:", error);
                });
            }
    
            const onVideoEnd = () => {
                if (api) {
                   api.scrollNext(); // Go to next slide
                   autoplayPlugin.current.play(); // Resume autoplay for subsequent slides
                }
            };
    
            currentVideo.addEventListener('ended', onVideoEnd, { once: true });
        } else {
            // For image slides, ensure autoplay is running
            if (!autoplayPlugin.current.isPlaying()) {
                autoplayPlugin.current.play();
            }
        }
    }, [api, heroItems]);

    useEffect(() => {
        if (!api) return;
        
        handleSelect(); // Handle the initial slide
        api.on('select', handleSelect);
        
        return () => {
            api.off('select', handleSelect);
        };
    }, [api, handleSelect]);
    
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
            setApi={setApi}
            className="w-full h-full"
            plugins={[autoplayPlugin.current]}
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
                            ref={el => videoRefs.current[index] = el}
                            src={item.videoUrl}
                            poster={item.mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                        />
                    ) : item.mediaUrl ? (
                        <Image
                            src={item.mediaUrl}
                            alt={item.description}
                            fill
                            className="object-cover"
                            data-ai-hint={item.imageHint || ''}
                            priority={index === 0}
                        />
                    ) : null}
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
