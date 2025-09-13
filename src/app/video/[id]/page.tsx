

'use client'

import { notFound, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ThumbsUp, ThumbsDown, Share2, Loader2, Play, Star, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useMemo, useState, useEffect } from 'react';
import { useVideos } from '@/hooks/use-videos';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';


function formatCount(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
}

function getYouTubeEmbedUrl(url: string, autoplay = false) {
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.substring(1);
        }
    } catch (e) {
        return null;
    }

    if (!videoId) return null;

    const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        controls: '1',
    });
    if (autoplay) {
        params.set('autoplay', '1');
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}


export default function VideoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { videos, loading, setVideos } = useVideos();
  const { toast } = useToast();
  
  const video = useMemo(() => {
    return videos.find((v) => v.id === id);
  }, [videos, id]);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  
  // Check user subscription status
  useEffect(() => {
    if (!video || !video.isPaid) {
        setHasAccess(true);
        setCheckingAccess(false);
        return;
    }

    if (!user) {
        setHasAccess(false);
        setCheckingAccess(false);
        return;
    }

    const checkSubscription = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const expiry = userData.subscriptionExpiry?.toDate();
            if (expiry && expiry > new Date()) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        } else {
            setHasAccess(false);
        }
        setCheckingAccess(false);
    };

    checkSubscription();
  }, [user, video]);


  // Increment view count if user has access
  useEffect(() => {
      if (id && hasAccess && !checkingAccess) {
          const videoRef = doc(db, "videos", id);
          updateDoc(videoRef, {
              views: increment(1)
          }).then(() => {
              setVideos(prevVideos => prevVideos.map(v => 
                  v.id === id ? { ...v, views: v.views + 1 } : v
              ));
          }).catch(err => console.error("Failed to increment views:", err));
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hasAccess, checkingAccess]);


  if (loading || checkingAccess) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    notFound();
  }
  
  const uploadDate = video.uploadDate ? format(new Date(video.uploadDate), "d MMM yyyy", { locale: fr }) : 'Date inconnue';
  const youtubeEmbedUrl = getYouTubeEmbedUrl(video.src);
  const youtubeEmbedUrlAutoplay = getYouTubeEmbedUrl(video.src, true);

  const handleLike = async () => {
    if (isLiked) return;
    setIsLiked(true);
    const videoRef = doc(db, "videos", id);
    try {
        await updateDoc(videoRef, {
            likes: increment(1)
        });
        setVideos(prevVideos => prevVideos.map(v => 
            v.id === id ? { ...v, likes: v.likes + 1 } : v
        ));
    } catch (error) {
        console.error("Failed to update likes", error);
        setIsLiked(false); // Revert state on error
    }
  };

  const handleSubscribe = async () => {
      if (isSubscribed) return;
      setIsSubscribed(true);
      const videoRef = doc(db, "videos", id);
      try {
          await updateDoc(videoRef, {
            'creator.subscribers': increment(1)
          });
          setVideos(prevVideos => prevVideos.map(v => 
            v.id === id ? { ...v, creator: { ...v.creator, subscribers: v.creator.subscribers + 1 } } : v
        ));
      } catch (error) {
          console.error("Failed to update subscribers", error);
          setIsSubscribed(false);
      }
  }

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: video.title,
                text: `Regardez cette vidéo : ${video.title}`,
                url: window.location.href,
            });
        } catch (error) {
            // User cancelled the share action, do nothing.
        }
    } else {
        toast({ variant: 'destructive', title: 'Non supporté', description: 'Votre navigateur ne supporte pas le partage natif.' });
    }
  };


  const VideoPlayer = () => {
      if (!hasAccess) {
          return (
             <div className="aspect-video w-full flex items-center justify-center bg-black rounded-lg">
                <Card className="max-w-md text-center bg-background/90 border-primary">
                    <CardHeader>
                        <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-2">
                           <Star className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <CardTitle>Contenu Payant</CardTitle>
                        <CardDescription>Cette vidéo est réservée aux abonnés. Choisissez un forfait pour la regarder.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/subscribe">S'abonner maintenant</Link>
                        </Button>
                    </CardFooter>
                </Card>
             </div>
          )
      }
      return (
        <div className="overflow-hidden rounded-lg bg-black aspect-video relative">
            {!showVideo && youtubeEmbedUrl ? (
                <div className="w-full h-full cursor-pointer relative group" onClick={() => setShowVideo(true)}>
                    {video.imageUrl ? (
                        <Image
                            src={video.imageUrl}
                            alt={video.title}
                            fill
                            className="object-cover"
                            data-ai-hint={video.dataAiHint}
                        />
                    ) : null}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-16 w-16 text-white" />
                    </div>
                </div>
            ) : youtubeEmbedUrlAutoplay ? (
                <iframe
                    src={youtubeEmbedUrlAutoplay}
                    title={video.title}
                    frameBorder="0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full"
                />
            ) : video.src ? (
                <video
                    src={video.src}
                    controls
                    autoPlay
                    className="w-full h-full"
                />
            ) : null}
        </div>
      );
  }


  return (
    <div className="w-full">
        <div className="p-4 md:p-6 space-y-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="h-6 w-6" />
            </Button>

            <VideoPlayer />
            
            <div className="pt-4 space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{video.title}</h1>
                
                <div className="text-sm text-muted-foreground">
                    <span>{formatCount(video.views)} vues</span>
                    <span className="mx-2">•</span>
                    <span>{uploadDate}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={video.creator.avatar} alt={video.creator.name} />
                            <AvatarFallback>{video.creator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold text-foreground">{video.creator.name}</div>
                            <div className="text-xs text-muted-foreground">{formatCount(video.creator.subscribers)} abonnés</div>
                        </div>
                    </div>
                    <Button variant={isSubscribed ? 'secondary' : 'default'} onClick={handleSubscribe} disabled={isSubscribed}>
                        {isSubscribed ? 'Abonné' : 'S\'abonner à la chaîne'}
                    </Button>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <div className="flex items-center rounded-full bg-muted">
                        <Button variant="ghost" className="rounded-r-none rounded-l-full flex items-center gap-2 pl-4" onClick={handleLike} disabled={isLiked}>
                            <ThumbsUp className="h-5 w-5"/>
                            <span>{formatCount(video.likes)}</span>
                        </Button>
                        <Separator orientation="vertical" className="h-6 bg-border" />
                        <Button variant="ghost" className="rounded-l-none rounded-r-full">
                            <ThumbsDown className="h-5 w-5"/>
                        </Button>
                    </div>
                    <Button variant="secondary" className="rounded-full flex items-center gap-2" onClick={handleShare}>
                        <Share2 className="h-5 w-5"/>
                        Partager
                    </Button>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                    <h2 className="font-semibold pb-2">Description</h2>
                    <p className="text-sm whitespace-pre-wrap text-foreground/80">{video.description}</p>
                </div>
            </div>
       </div>
    </div>
  );
}

    