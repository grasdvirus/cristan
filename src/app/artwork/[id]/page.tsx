

'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Loader2, ExternalLink, Check } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { useMemo, useState, useEffect } from 'react';
import { useCartStore } from '@/hooks/use-cart-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ArtworkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products, loading: loadingProducts, error } = useProducts();
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const artwork = useMemo(() => {
    return products.find(p => p.id === id);
  }, [products, id]);
  
  const [selectedImage, setSelectedImage] = useState(artwork?.imageUrls?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (artwork && artwork.imageUrls && artwork.imageUrls.length > 0) {
      setSelectedImage(artwork.imageUrls[0]);
    }
     // Pre-select first option if available
    if (artwork?.colors && artwork.colors.length > 0) {
      setSelectedColor(artwork.colors[0]);
    }
    if (artwork?.sizes && artwork.sizes.length > 0) {
      setSelectedSize(artwork.sizes[0]);
    }
  }, [artwork]);
  
  const loading = loadingProducts;

  const handleAddToCart = () => {
    if (artwork) {
        addToCart({ ...artwork, selectedColor, selectedSize });
        toast({
            title: "Ajouté au panier !",
            description: `"${artwork.title}" a été ajouté à votre panier.`,
        });
    }
  };

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
            Erreur de chargement du produit : {error}
        </div>
    );
  }

  if (!artwork) {
    notFound();
  }
  
  const isInternetProduct = !!artwork.internetClass;
  const hasOptions = (artwork.colors && artwork.colors.length > 0) || (artwork.sizes && artwork.sizes.length > 0);

  return (
    <div className="space-y-8">
      <Link href="/decouvrir" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la boutique
        </Button>
      </Link>
      <Card className="overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col">
                <div className="relative aspect-square w-full">
                    {selectedImage ? (
                        <Image
                            src={selectedImage}
                            alt={artwork.title}
                            fill
                            className="object-cover"
                            data-ai-hint={artwork.dataAiHint}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                            <span className="text-muted-foreground">Pas d'image</span>
                        </div>
                    )}
                </div>
                 {artwork.imageUrls && artwork.imageUrls.length > 1 && (
                    <div className="flex gap-2 p-2 bg-muted/20">
                        {artwork.imageUrls.map((url, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(url)}
                                className={cn(
                                    "relative aspect-square w-20 rounded-md overflow-hidden transition-all",
                                    selectedImage === url ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:opacity-80'
                                )}
                            >
                                <Image
                                    src={url}
                                    alt={`Miniature ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl text-primary">{artwork.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-grow">
                    <p className="text-base text-foreground/90">{artwork.description}</p>
                     {hasOptions ? (
                        <div className="space-y-4">
                            {artwork.colors && artwork.colors.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Couleurs</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {artwork.colors.map(color => (
                                            <Button
                                                key={color}
                                                variant={selectedColor === color ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedColor(color)}
                                                className="transition-all"
                                            >
                                                 {selectedColor === color && <Check className="mr-2 h-4 w-4" />}
                                                {color}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {artwork.sizes && artwork.sizes.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tailles</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {artwork.sizes.map(size => (
                                            <Button
                                                key={size}
                                                variant={selectedSize === size ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedSize(size)}
                                                 className="transition-all"
                                            >
                                                {selectedSize === size && <Check className="mr-2 h-4 w-4" />}
                                                {size}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </CardContent>
                 <CardFooter className="flex-col items-stretch gap-4 p-6 bg-card/50">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('fr-FR').format(artwork.price)} FCFA</span>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2">
                        {isInternetProduct && artwork.redirectUrl ? (
                             <>
                                <Button variant="outline" asChild className="flex-1 justify-center py-3">
                                    <a href={artwork.redirectUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-5 w-5" />
                                        Visiter le site
                                    </a>
                                </Button>
                                <Button className="flex-1 justify-center py-3" onClick={handleAddToCart}>
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Ajouter au panier
                                </Button>
                            </>
                        ) : (
                            <Button className="w-full py-3" onClick={handleAddToCart}>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Ajouter au panier
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </div>
        </div>
      </Card>
    </div>
  );
}
