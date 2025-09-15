

'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Loader2, ExternalLink, Check, Heart, MessageCircle, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/hooks/use-cart-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, increment, onSnapshot, getDoc } from "firebase/firestore";
import type { Product, Comment } from '@/lib/products';
import { useAuth } from '@/components/auth-provider';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';

async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
}

export default function ArtworkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [artwork, setArtwork] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!id) {
        setLoading(false);
        return;
    }

    setLoading(true);
    // Use onSnapshot for real-time updates of comments/likes
    const unsub = onSnapshot(doc(db, "products", id), (doc) => {
        if (doc.exists()) {
            const data = { id: doc.id, ...doc.data() } as Product;
            setArtwork(data);
            
            // Set initial selections only when the component first loads
            // or when the artwork ID changes.
            if (!artwork || artwork.id !== data.id) {
                 if (data.mediaUrls && data.mediaUrls.length > 0) {
                    setSelectedImage(data.mediaUrls[0]);
                }
                if (data.colors && data.colors.length > 0) {
                    setSelectedColor(data.colors[0]);
                }
                if (data.sizes && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                }
            }
        }
        setLoading(false);
    }, (err) => {
        console.error("Error fetching product:", err);
        setLoading(false);
    });

    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  
  const handleAddToCart = () => {
    if (artwork) {
        addToCart({ ...artwork, selectedColor, selectedSize });
        toast({
            title: "Ajouté au panier !",
            description: `"${artwork.title}" a été ajouté à votre panier.`,
        });
    }
  };

  const handleLike = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Connectez-vous pour aimer ce produit."});
        return;
    }
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, {
      likes: increment(1)
    });
  };

  const handleCommentSubmit = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Connectez-vous pour commenter."});
        return;
    }
    if (commentText.trim() === "") return;

    setIsSubmitting(true);
    const productRef = doc(db, "products", id);
    const newComment: Comment = {
        id: uuidv4(),
        author: user.email || "Anonyme",
        text: commentText,
        createdAt: new Date(),
    };
    
    try {
        await updateDoc(productRef, {
            comments: arrayUnion(newComment)
        });
        setCommentText("");
    } catch(err) {
        console.error("Error adding comment: ", err);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible d'ajouter le commentaire."});
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!artwork) {
    notFound();
  }
  
  const isInternetProduct = !!artwork.internetClass;
  const hasOptions = (artwork.colors && artwork.colors.length > 0) || (artwork.sizes && artwork.sizes.length > 0);
  const sortedComments = artwork.comments?.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds) || [];

  return (
    <>
      <div className="space-y-8">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
          </Button>
        <Card className="overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col">
                  <div className="relative aspect-square w-full bg-black/10">
                      {selectedImage ? (
                          <Image
                              src={selectedImage}
                              alt={artwork.title}
                              fill
                              className="object-contain"
                              data-ai-hint={artwork.dataAiHint}
                              sizes="(max-width: 768px) 100vw, 50vw"
                          />
                      ) : (
                          <div className="flex items-center justify-center h-full bg-muted">
                              <span className="text-muted-foreground">Pas d'image</span>
                          </div>
                      )}
                  </div>
                   {artwork.mediaUrls && artwork.mediaUrls.length > 1 && (
                      <div className="flex gap-2 p-2 bg-muted/20">
                          {artwork.mediaUrls.map((url, index) => (
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
                      <Separator />
                       <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                               <button onClick={handleLike} className="flex items-center gap-1.5 group">
                                  <Heart className={cn("h-5 w-5 transition-colors group-hover:fill-red-500 group-hover:text-red-500")} />
                                  <span>{artwork.likes || 0} J'aime</span>
                              </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                              <MessageCircle className="h-5 w-5" />
                              <span>{artwork.comments?.length || 0} Commentaires</span>
                          </div>
                      </div>
                  </CardContent>
                   <CardFooter className="flex-col items-stretch gap-4 p-6 bg-card/50">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('fr-FR').format(artwork.price)} FCFA</span>
                            {artwork.originalPrice && artwork.originalPrice > artwork.price && (
                                <span className="text-lg text-muted-foreground line-through">
                                    {new Intl.NumberFormat('fr-FR').format(artwork.originalPrice)} FCFA
                                </span>
                            )}
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
        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>Commentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
               {user ? (
                  <div className="flex items-start gap-4">
                      <Textarea 
                          placeholder="Laissez votre commentaire..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={2}
                          className="flex-grow"
                      />
                      <Button onClick={handleCommentSubmit} disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                      </Button>
                  </div>
              ) : (
                  <div className="text-center text-muted-foreground p-4 border rounded-md">
                      <Link href="/login" className="underline">Connectez-vous</Link> pour laisser un commentaire.
                  </div>
              )}
              <div className="space-y-4">
                  {sortedComments.map(comment => (
                      <div key={comment.id} className="flex flex-col gap-1 border-b pb-4">
                          <p className="font-semibold text-sm">{comment.author}</p>
                          <p className="text-muted-foreground">{comment.text}</p>
                          <p className="text-xs text-muted-foreground/70 self-end">
                              {comment.createdAt?.seconds ? format(new Date(comment.createdAt.seconds * 1000), 'd MMM yyyy, HH:mm', { locale: fr }) : ''}
                          </p>
                      </div>
                  ))}
              </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
