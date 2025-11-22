
'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Separator } from '@/components/ui/separator';

type PartnerMessage = {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
};

function AllMessagesContent() {
    const { firestore } = useFirebase();
    const messagesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'partnerMessages'), orderBy('createdAt', 'desc'));
    }, [firestore]);
    const { data: messages, isLoading } = useCollection<PartnerMessage>(messagesQuery);
    
    // Marquer les messages comme lus en mettant à jour le localStorage
    useEffect(() => {
        if (messages && messages.length > 0) {
            const latestMessageTimestamp = messages[0].createdAt.seconds.toString();
            localStorage.setItem('lastSeenPartnerMessageTimestamp', latestMessageTimestamp);
        }
    }, [messages]);

    const formatRelativeTime = (timestamp: Timestamp | null) => {
        if (!timestamp) return 'à l\'instant';
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: fr });
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-3xl mx-auto">
                <div className="relative mb-8">
                     <Button 
                        asChild
                        variant="ghost" 
                        size="icon"
                        className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                        aria-label="Retour"
                    >
                        <Link href="/partner/register">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
                 <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline">Messages aux Partenaires</h1>
                    <p className="text-muted-foreground mt-2">
                        Toutes les annonces et informations importantes.
                    </p>
                </div>

                 <div className="space-y-8">
                    {messages && messages.length > 0 ? messages.map(msg => (
                        <NeumorphicCard key={msg.id} className="p-6">
                           <h3 className="text-xl font-bold font-headline">{msg.title}</h3>
                           <p className="text-xs text-muted-foreground mb-4">{formatRelativeTime(msg.createdAt)}</p>
                           <Separator className="mb-4" />
                           <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </NeumorphicCard>
                    )) : (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">Aucun message pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


export default function AllPartnerMessagesPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AuthGuard>
                <AllMessagesContent />
            </AuthGuard>
        </Suspense>
    );
}
