"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import React from 'react';

export default function HeroSection() {
  const heroImages = PlaceHolderImages.filter(
    (img) => img.id.startsWith('hero-')
  );
  const autoplay = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false })
  );

  if (!heroImages.length) {
    return (
      <section className="relative w-full h-[60vh] md:h-[80vh] bg-muted flex items-center justify-center">
        <p>Images non trouvées.</p>
      </section>
    );
  }

  return (
    <section className="sticky top-0 w-full h-[60vh] md:h-[80vh] bg-background overflow-hidden -z-10">
      <Carousel
        className="w-full h-full"
        plugins={[autoplay.current, Fade()]}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {heroImages.map((heroImage, index) => (
            <CarouselItem key={heroImage.id} className="h-full">
              <div className="w-full h-full relative">
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={heroImage.imageHint}
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end justify-start text-white">
                  <div className="container p-8 md:p-12">
                    <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight drop-shadow-lg">
                      {heroImage.description}
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
