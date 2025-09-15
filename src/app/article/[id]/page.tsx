

'use client'

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Heart, MessageCircle, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useViewStore } from '@/hooks/use-view-store';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, increment, onSnapshot } from "firebase/firestore";
import type { Product, Comment } from '@/lib/products';
import { useAuth } from '@/components/auth-provider';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { addViewedArticle } = useViewStore();
  const { toast } = useToast();

  const [article, setArticle] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
        setError("No ID provided");
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const unsub = onSnapshot(doc(db, "products", id), (doc) => {
        if (doc.exists()) {
            setArticle({ id: doc.id, ...doc.data() } as Product);
        } else {
            setError("Article not found");
        }
        setLoading(false);
    }, (err) => {
        console.error("Error fetching article:", err);
        setError("Failed to fetch article");
        setLoading(false);
    });

    return () => unsub();
  }, [id]);


  useEffect(() => {
    if (article) {
      addViewedArticle(article.id);
    }
  }, [article, addViewedArticle]);
  
  const handleLike = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Connectez-vous pour aimer cet article."});
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
  
  const sortedComments = article.comments?.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds) || [];

  return (
    <>
      <div className="space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
          </Button>
        </Link>
        <Card className="overflow-hidden shadow-lg">
           <CardHeader>
              <CardTitle className="font-headline text-4xl text-primary">{article.title}</CardTitle>
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                      <button onClick={handleLike} className="flex items-center gap-1.5 group">
                          <Heart className={cn("h-5 w-5 transition-colors group-hover:fill-red-500 group-hover:text-red-500")} />
                          <span>{article.likes || 0} J'aime</span>
                      </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                      <MessageCircle className="h-5 w-5" />
                      <span>{article.comments?.length || 0} Commentaires</span>
                  </div>
              </div>
          </CardHeader>
          <CardContent className="space-y-8">
              <div className="relative min-h-[300px] md:min-h-[500px] bg-black/10 rounded-lg">
                   {article.mediaUrls && article.mediaUrls.length > 0 && (
                      <Carousel className="w-full h-full">
                          <CarouselContent>
                              {article.mediaUrls.map((mediaUrl, index) => (
                                  <CarouselItem key={index}>
                                      <div className="relative w-full h-[300px] md:h-[500px] flex items-center justify-center">
                                          {mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') ? (
                                              <video
                                                  src={mediaUrl}
                                                  controls
                                                  playsInline
                                                  className="w-full h-full object-contain"
                                                  preload="metadata"
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
                                  <CarouselPrevious className="left-2" />
                                  <CarouselNext className="right-2" />
                              </>
                          )}
                      </Carousel>
                   )}
              </div>
              
              <p className="text-base text-foreground/90 whitespace-pre-wrap">{article.description}</p>

              <Separator />

              <div className="space-y-6">
                  <h3 className="text-2xl font-bold font-headline">Commentaires</h3>
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
                                  {format(new Date(comment.createdAt.seconds * 1000), 'd MMM yyyy, HH:mm', { locale: fr })}
                              </p>
                          </div>
                      ))}
                  </div>
              </div>

          </CardContent>
        </Card>
      </div>
    </>
  );
}
