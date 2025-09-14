


'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useCartStore } from '@/hooks/use-cart-store';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

export default function PanierPage() {
  const { items, removeFromCart, total } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/paiement');
  };

  return (
    <div className="flex justify-center items-start">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center gap-4">
            <ShoppingCart className="h-8 w-8" /> Votre Panier
          </CardTitle>
          <CardDescription className="text-lg">
            Vérifiez les articles dans votre panier avant de passer à la caisse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p className="text-xl mb-2">Votre panier est vide.</p>
              <Link href="/decouvrir">
                <Button variant="link">Parcourir les articles</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                 <div key={item.cartId} className="flex items-center gap-4">
                    <Link href={`/artwork/${item.id}`} className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0 group">
                        {item.mediaUrls && item.mediaUrls.length > 0 && (
                        <Image src={item.mediaUrls[0]} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" />
                        )}
                    </Link>
                    <div className="flex-grow">
                        <Link href={`/artwork/${item.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors">{item.title}</h3>
                        </Link>
                        <div className="text-sm text-muted-foreground">
                            {item.selectedColor && <p>Couleur: {item.selectedColor}</p>}
                            {item.selectedSize && <p>Taille: {item.selectedSize}</p>}
                        </div>
                        <p className="text-sm text-muted-foreground">{new Intl.NumberFormat('fr-FR').format(item.price)} FCFA</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.cartId!)}>
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                 </div>
              ))}
            </div>
          )}
        </CardContent>
        {items.length > 0 && (
          <CardFooter className="flex-col items-stretch gap-4 p-6 bg-muted/20">
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold py-4">
              <span>Total</span>
              <span>{new Intl.NumberFormat('fr-FR').format(total)} FCFA</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" asChild className="flex-1 py-3">
                    <Link href="/decouvrir">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Continuer les achats
                    </Link>
                </Button>
                <Button onClick={handleCheckout} className="flex-1 py-3">
                    Passer au paiement <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

