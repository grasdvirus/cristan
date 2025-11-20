'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NewsItem = {
    id: string;
    title: string;
    description: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    externalLink?: string;
    createdAt: { seconds: number; nanoseconds: number; };
};

function NewsSkeleton() {
    return (
        <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, i) => (
                <NeumorphicCard key={i} className="overflow-hidden p-0 sm:p-2">
                    <Skeleton className="w-full h-64 sm:h-96" />
                    <div className="p-4 sm:p-6">
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-8 w-3/4 mb-4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </NeumorphicCard>
            ))}
        </div>
    );
}


export default function NewsPage() {
    const { firestore } = useFirebase();
    const newsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'news'), orderBy('createdAt', 'desc')) : null,
        [firestore]
    );
    const { data: newsItems, isLoading } = useCollection<NewsItem>(newsQuery);
    
    const formatDate = (timestamp: { seconds: number; }) => {
        if (!timestamp) return 'Date inconnue';
        const date = new Date(timestamp.seconds * 1000);
        return format(date, "d MMMM yyyy", { locale: fr });
    };

    return (
        <div className="container mx-auto px-0 sm:px-4 py-8 sm:py-16">
            <div className="max-w-3xl mx-auto">
                 <div className="mb-8">
                    <Button 
                        asChild
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                        aria-label="Retour"
                    >
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline">Actualités</h1>
                    <p className="text-muted-foreground mt-2">
                        Les dernières nouvelles, annonces et publicités.
                    </p>
                </div>

                {isLoading ? <NewsSkeleton /> : (
                    <div className="space-y-12">
                        {newsItems && newsItems.length > 0 ? (
                             newsItems.map(item => (
                                <NeumorphicCard key={item.id} className="overflow-hidden p-0 sm:p-2">
                                    <div className="relative aspect-video bg-muted neumorphic-card-inset-light dark:neumorphic-card-inset-dark sm:rounded-xl overflow-hidden">
                                        {item.mediaType === 'image' ? (
                                            <Image src={item.mediaUrl} alt={item.title} fill className="object-cover"/>
                                        ) : (
                                            <iframe
                                                src={item.mediaUrl}
                                                title={item.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full"
                                            ></iframe>
                                        )}
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <p className="text-sm text-muted-foreground mb-1">{formatDate(item.createdAt)}</p>
                                        <h2 className="text-2xl font-bold font-headline mb-3">{item.title}</h2>
                                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                        {item.externalLink && (
                                            <Button asChild variant="outline" className="mt-4 btn-neumorphic-light dark:btn-neumorphic-dark">
                                                <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
                                                    En savoir plus <ExternalLink className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </NeumorphicCard>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-muted-foreground">Aucune actualité pour le moment.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
