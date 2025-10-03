"use client";

import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import heroImagesData from '@/lib/placeholder-images.json';

export default function HeroSection() {
  const heroImages = heroImagesData.placeholderImages.filter((img) =>
    img.id.startsWith('hero-')
  );

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] bg-background flex items-center justify-center overflow-hidden">
      <Carousel
        className="w-full h-full"
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full">
          {heroImages.map((image, index) => (
            <CarouselItem key={index} className="h-full relative">
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center text-center text-white p-4">
                <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight drop-shadow-lg">
                  {image.description}
                </h2>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
      </Carousel>
    </section>
  );
}
