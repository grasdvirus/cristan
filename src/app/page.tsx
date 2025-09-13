
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Globe, ShoppingBag, Tv, ArrowRight, Loader2 } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";
import React, { useRef } from 'react';
import { useFilterStore } from '@/hooks/use-filter-store';
import { useProducts } from '@/hooks/use-products';
import { useSlides } from '@/hooks/use-slides';


export default function Home() {
  const { activeArticleCategory } = useFilterStore();
  
  const { products, loading: loadingProducts, error: productsError } = useProducts();
  const { slides, loading: loadingSlides, error: slidesError } = useSlides();

  const autoplayPlugin = useRef(
      Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: false })
  );
  
  const loading = loadingProducts || loadingSlides;

  const filteredArticles = products.filter(product => 
    (product.articleCategory) && (activeArticleCategory === 'all' || product.articleCategory === activeArticleCategory)
  );

  if (loading) {
    return (
       <div className="flex h-96 w-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (productsError || slidesError) {
      return (
        <div className="flex h-96 w-full items-center justify-center text-red-500 text-center">
            <p>Erreur de chargement des données. Veuillez réessayer plus tard.</p>
            {productsError && <p>Erreur produits: {productsError}</p>}
            {slidesError && <p>Erreur slides: {slidesError}</p>}
        </div>
      )
  }

  return (
    <div className="space-y-12">

      <section className="relative -mt-12 -mx-4 sm:-mx-6 lg:-mx-8">
        {slides.length > 0 ? (
            <Carousel
            plugins={[autoplayPlugin.current]}
            className="w-full"
            opts={{
                loop: true,
            }}
            >
            <CarouselContent>
                {slides.map((slide, index) => (
                <CarouselItem key={slide.id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="relative h-96 lg:col-span-2">
                        <Image
                        src={slide.imageUrl}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        data-ai-hint={slide.dataAiHint}
                        priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </div>
                    <div className="flex items-center justify-center p-8 bg-background lg:p-12">
                        <div className="max-w-md text-center lg:text-left">
                        <h1 className="font-headline text-4xl lg:text-5xl text-primary">{slide.title}</h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                            {slide.subtitle}
                        </p>
                        </div>
                    </div>
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            </Carousel>
        ) : (
            <div className="flex items-center justify-center h-96 bg-muted">
                <p className="text-muted-foreground">Aucun slide à afficher.</p>
            </div>
        )}
      </section>

      <section id="actions" className="py-2">
        <div className="grid grid-cols-3 gap-6">
          <Link href="/decouvrir?category=internet" className="group">
            <Card className="bg-card/80 hover:bg-card transition-all duration-300 ease-in-out h-full flex flex-col justify-center items-center py-4 rounded-3xl shadow-lg hover:shadow-primary/20">
              <Globe className="h-8 w-8 text-primary" />
            </Card>
          </Link>
          <Link href="/decouvrir?category=all" className="group">
            <Card className="bg-card/80 hover:bg-card transition-all duration-300 ease-in-out h-full flex flex-col justify-center items-center py-4 rounded-3xl shadow-lg hover:shadow-primary/20">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </Card>
          </Link>
          <Link href="/decouvrir?category=tv" className="group">
            <Card className="bg-card/80 hover:bg-card transition-all duration-300 ease-in-out h-full flex flex-col justify-center items-center py-4 rounded-3xl shadow-lg hover:shadow-primary/20">
              <Tv className="h-8 w-8 text-primary" />
            </Card>
          </Link>
        </div>
      </section>

      <section id="gallery">
        <div className="flex justify-center items-center mb-4 relative">
            <h2 className="font-headline text-3xl text-primary text-center">
              Dernières Actualités
            </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((product) => (
            <Card key={product.id} className="overflow-hidden group transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-primary/20 shadow-lg flex flex-col">
              <CardContent className="p-0">
                 {product.imageUrls && product.imageUrls.length > 0 && (
                    <Image
                      src={product.imageUrls[0]}
                      alt={product.title}
                      width={600}
                      height={400}
                      className="object-cover w-full h-64 transition-transform duration-300 ease-in-out group-hover:scale-110"
                      data-ai-hint={product.dataAiHint}
                    />
                 )}
              </CardContent>
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-foreground">{product.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/article/${product.id}`} passHref className="p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
                    <ArrowRight className="h-4 w-4 animate-horizontal-bounce" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
