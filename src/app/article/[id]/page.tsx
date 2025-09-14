

'use client'

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { useMemo } from 'react';
import { useViewStore } from '@/hooks/use-view-store';
import { useEffect } from 'react';

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products, loading: loadingProducts, error } = useProducts();
  const { addViewedArticle } = useViewStore();

  const article = useMemo(() => {
    return products.find(p => p.id === id);
  }, [products, id]);

  useEffect(() => {
    if (article) {
      addViewedArticle(article.id);
    }
  }, [article, addViewedArticle]);
  
  const loading = loadingProducts;

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex h-96 w-full items-center justify-center text-red-500">
            Erreur de chargement de l'article : {error}
        </div>
    );
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
        </Button>
      </Link>
      <Card className="overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative min-h-[300px] md:min-h-[500px]">
                 {article.mediaUrls && article.mediaUrls.length > 0 && (
                    <Carousel className="w-full h-full">
                        <CarouselContent>
                            {article.mediaUrls.map((mediaUrl, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative w-full h-[300px] md:h-[500px]">
                                        {mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') ? (
                                            <video
                                                src={mediaUrl}
                                                controls
                                                playsInline
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <Image
                                                src={mediaUrl}
                                                alt={`${article.title} - Média ${index + 1}`}
                                                fill
                                                className="object-contain"
                                                data-ai-hint={article.dataAiHint}
                                            />
                                        )}
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {article.mediaUrls.length > 1 && (
                            <>
                                <CarouselPrevious className="left-4" />
                                <CarouselNext className="right-4" />
                            </>
                        )}
                    </Carousel>
                 )}
            </div>
            <div className="flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl text-primary">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                    <p className="text-base text-foreground/90">{article.description}</p>
                </CardContent>
            </div>
        </div>
      </Card>
    </div>
  );
}

    

