
'use client';

import Image from 'next/image';
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="break-inside-avoid">
                    <NeumorphicCard className="p-0 space-y-4 h-full flex flex-col">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-6 flex flex-col flex-grow">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/4 mb-4" />
                            <Skeleton className="h-10 w-full mb-4" />
                            <div className="mt-auto">
                                <Skeleton className="h-12 w-full" />
                            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {games.map((game) => (
                    <div key={game.id} className="break-inside-avoid">
                        <NeumorphicCard className="group overflow-hidden flex flex-col h-full p-0 transition-all duration-300 hover:-translate-y-1">
                            <div className="overflow-hidden relative">
                                {game.imageUrl && (game.imageUrl.startsWith('http') || game.imageUrl.startsWith('/')) ? (
                                    <Image
                                        src={game.imageUrl}
                                        alt={game.title}
                                        width={500}
                                        height={350}
                                        className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={game.imageHint}
                                    />
                                ) : (
                                    <div className="w-full h-52 bg-muted flex items-center justify-center">
                                        <span className="text-sm text-muted-foreground">Pas d'image</span>
                                    </div>
                                )}
                            </div>
                            <div className='flex flex-col flex-grow p-6'>
                                <CardTitle className="font-headline text-xl mb-1">{game.title}</CardTitle>
                                <Badge variant="secondary" className="neumorphic-card-light dark:neumorphic-card-dark w-fit mb-3">{game.category}</Badge>
                                <CardDescription className="text-sm text-muted-foreground flex-grow mb-6">{game.description}</CardDescription>
                                
                                <div className="mt-auto">
                                    <Button asChild size="lg" className="w-full font-bold text-lg btn-neumorphic-light dark:btn-neumorphic-dark">
                                        <a href={game.affiliateUrl} target="_blank" rel="noopener noreferrer">
                                            <Gamepad2 className="mr-2 h-5 w-5" />
                                            Jouer maintenant
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
