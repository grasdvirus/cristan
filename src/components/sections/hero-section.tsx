"use client";

import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  const heroImages = PlaceHolderImages.filter((img) =>
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
            <CarouselItem key={index} className="h-full">
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/40" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
      </Carousel>
      <div className="absolute z-10 text-center text-white p-4">
        <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight drop-shadow-lg">
          Bienvenue sur Mon Portfolio
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200 drop-shadow-md">
          Découvrez mes projets, mes compétences et mon parcours. Un aperçu de ma passion pour le développement et le design.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg" className="bg-white/90 text-black hover:bg-white backdrop-blur-sm">
            <Link href="#projects">Mes Projets</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 backdrop-blur-sm">
            <Link href="#videos">Vidéos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
