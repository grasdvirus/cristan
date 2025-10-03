"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HeroSection() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

  if (!heroImage) {
    return (
        <section className="relative w-full h-[60vh] md:h-[80vh] bg-muted flex items-center justify-center">
            <p>Image non trouvée.</p>
        </section>
    );
  }

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] bg-background flex items-center justify-center overflow-hidden">
      <Image
        src={heroImage.imageUrl}
        alt={heroImage.description}
        fill
        className="object-cover"
        data-ai-hint={heroImage.imageHint}
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center justify-center text-center text-white p-4">
        <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight drop-shadow-lg">
          {heroImage.description}
        </h2>
      </div>
    </section>
  );
}
