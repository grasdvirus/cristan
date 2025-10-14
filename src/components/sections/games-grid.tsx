
'use client';

import Image from 'next/image';
import Link from 'next/link';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardDescription, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Gamepad2 } from 'lucide-react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

type Game = {
    id: string;
    title: string;
    description: string;
    category: string;
    affiliateUrl: string;
    imageUrl: string;
    imageHint: string;
};

function GameGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="break-inside-avoid">
                    <NeumorphicCard className="p-0 space-y-4">
                        <Skeleton className="h-40 w-full" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>
                    </NeumorphicCard>
                </div>
            ))}
        </div>
    );
}

export default function GamesGrid() {
    const { firestore } = useFirebase();
    const gamesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'games')) : null, [firestore]);
    const { data: games, isLoading } = useCollection<Game>(gamesQuery);

    if (isLoading) {
        return <GameGridSkeleton />;
    }

    if (!games || games.length === 0) {
        return <p className="text-center text-muted-foreground">Aucun jeu trouvé pour le moment.</p>
    }

    return (
        <section id="games" className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {games.map((game) => (
                    <div key={game.id} className="break-inside-avoid">
                        <NeumorphicCard className="group overflow-hidden flex flex-col h-full p-0">
                            <div className="overflow-hidden relative">
                                {game.imageUrl && (game.imageUrl.startsWith('http') || game.imageUrl.startsWith('/')) ? (
                                    <Image
                                        src={game.imageUrl}
                                        alt={game.title}
                                        width={500}
                                        height={350}
                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={game.imageHint}
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                                        <span className="text-sm text-muted-foreground">Pas d'image</span>
                                    </div>
                                )}
                                 <Badge variant="secondary" className="absolute top-2 right-2 neumorphic-card-light dark:neumorphic-card-dark">{game.category}</Badge>
                            </div>
                            <div className='flex flex-col flex-grow p-4'>
                                <CardTitle className="font-headline text-lg">{game.title}</CardTitle>
                                <CardDescription className="mt-2 text-sm text-muted-foreground flex-grow">{game.description}</CardDescription>
                                <div className="flex justify-end items-center mt-4">
                                    <Button asChild className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                                        <a href={game.affiliateUrl} target="_blank" rel="noopener noreferrer">
                                            <Gamepad2 className="mr-2 h-4 w-4" />
                                            Jouer
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </NeumorphicCard>
                    </div>
                ))}
            </div>
        </section>
    );
}

    