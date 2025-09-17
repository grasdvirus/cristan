
'use client';

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LogOut, User, Fingerprint, LogIn, LayoutGrid, Info, Megaphone, Send, Volume2, Loader2, MessageCircle } from "lucide-react";
import Link from 'next/link';
import { useFeatures } from "@/hooks/use-features";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Feature } from "@/lib/features";
import { produce } from "immer";


async function getSpeech(text: string): Promise<string | null> {
    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error('Failed to get speech');
        const { audioDataUri } = await response.json();
        return audioDataUri;
    } catch (error) {
        console.error('TTS Error:', error);
        return null;
    }
}


function FeatureCard({ feature, user, onFeedbackSubmit }: { feature: Feature, user: any, onFeedbackSubmit: (featureId: string, text: string) => Promise<void> }) {
    const { toast } = useToast();
    const [feedbackText, setFeedbackText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleFeedbackSubmit = async () => {
        if (!feedbackText.trim()) return;
        setIsSubmitting(true);
        await onFeedbackSubmit(feature.id, feedbackText);
        setFeedbackText("");
        setIsSubmitting(false);
    };
    
    const handlePlayTutorial = async () => {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }

        if (audioRef.current?.src) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            setIsGeneratingSpeech(true);
            const audioDataUri = await getSpeech(feature.description);
            setIsGeneratingSpeech(false);
            if (audioDataUri) {
                if (!audioRef.current) {
                    audioRef.current = new Audio();
                    audioRef.current.onended = () => setIsPlaying(false);
                }
                audioRef.current.src = audioDataUri;
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                toast({ variant: 'destructive', title: "Erreur de lecture", description: "Impossible de générer l'audio." });
            }
        }
    };
    
    useEffect(() => {
        // Cleanup audio on component unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>
                    Publié le {feature.createdAt ? format(new Date(feature.createdAt.seconds * 1000), 'd MMMM yyyy', { locale: fr }) : 'N/A'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{feature.description}</p>
                <Button onClick={handlePlayTutorial} disabled={isGeneratingSpeech} variant="outline" size="sm">
                    {isGeneratingSpeech ? <Loader2 className="mr-2 animate-spin" /> : <Volume2 className="mr-2" />}
                    {isPlaying ? 'Pause' : 'Lire le tuto'}
                </Button>
                <Separator />
                <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><MessageCircle /> Avis &amp; Réponses</h4>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {feature.feedback?.map(fb => (
                            <div key={fb.id} className="text-sm">
                                <p className="font-semibold text-foreground">{fb.authorEmail}</p>
                                <p className="text-muted-foreground">{fb.text}</p>
                                {fb.adminReply && (
                                     <div className="mt-2 ml-4 p-2 border-l-2 border-primary bg-primary/10 rounded-r-md">
                                        <p className="font-bold text-primary text-xs">Réponse de l'admin</p>
                                        <p className="text-muted-foreground italic">{fb.adminReply.text}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                     <div className="flex items-start gap-2">
                          <Textarea
                            placeholder="Donnez votre avis sur cette fonctionnalité..."
                            rows={2}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            disabled={isSubmitting}
                          />
                          <Button size="icon" onClick={handleFeedbackSubmit} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                          </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export default function ProfilePage() {
  const { user, signOutUser, loading } = useAuth();
  const { features, setFeatures, loading: loadingFeatures } = useFeatures();
  const { toast } = useToast();

  const handleFeedbackSubmit = async (featureId: string, text: string) => {
    if (!user) return;
    try {
        const response = await fetch('/api/features/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                featureId,
                text,
                authorId: user.uid,
                authorEmail: user.email,
            }),
        });
        if (!response.ok) throw new Error('Failed to submit feedback');

        // Optimistic update
        const newFeedback = {
            id: 'temp-id', // Temporary ID
            text,
            authorId: user.uid,
            authorEmail: user.email,
            createdAt: new Date()
        };

        setFeatures(produce(draft => {
            const feature = draft.find(f => f.id === featureId);
            if (feature) {
                if (!feature.feedback) feature.feedback = [];
                feature.feedback.push(newFeedback as any);
            }
        }));

        toast({ title: "Avis envoyé !", description: "Merci pour votre contribution." });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Erreur", description: "Impossible d'envoyer l'avis." });
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[400px]">
              <Fingerprint className="h-10 w-10 text-primary animate-pulse" />
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary rounded-full p-4 w-fit mb-4">
                <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="font-headline text-4xl text-primary">Votre Profil</CardTitle>
            <CardDescription className="text-lg">
                Gérez les informations de votre compte.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
           {user ? (
                <div className="space-y-4 text-center">
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Bienvenue !</h3>
                        <p className="text-muted-foreground break-words">{user.email}</p>
                    </div>

                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        {user.email === 'christianvirus77@gmail.com' && (
                            <Button asChild variant="secondary">
                                <Link href="/admin">
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    Panneau d'Administration
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="outline">
                            <Link href="/a-propos">
                                <Info className="mr-2 h-4 w-4" />
                                À propos du site
                            </Link>
                        </Button>
                        <Button onClick={signOutUser}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Se déconnecter
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 text-center">
                     <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Vous n'êtes pas connecté</h3>
                        <p className="text-muted-foreground">Créez un compte ou connectez-vous pour accéder à votre profil.</p>
                    </div>
                    <Button asChild className="w-full max-w-xs mx-auto">
                        <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            Inscription / Connexion
                        </Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
      
      {user && (
          <section className="space-y-6 max-w-3xl mx-auto">
                <div className="text-center space-y-2">
                    <h2 className="font-headline text-3xl text-primary flex items-center justify-center gap-3"><Megaphone/> Quoi de neuf ?</h2>
                    <p className="text-muted-foreground">Découvrez les dernières fonctionnalités et donnez-nous votre avis !</p>
                </div>
                {loadingFeatures ? (
                     <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : features.length > 0 ? (
                    features.map(feature => (
                        <FeatureCard key={feature.id} feature={feature} user={user} onFeedbackSubmit={handleFeedbackSubmit} />
                    ))
                ) : (
                    <p className="text-center text-muted-foreground">Aucune annonce pour le moment.</p>
                )}
          </section>
      )}
    </div>
  );
}
