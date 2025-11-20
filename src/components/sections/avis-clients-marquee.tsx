'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { NeumorphicCard } from '../neumorphic-card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

type AvisClient = {
    id: string;
    name: string;
    message: string;
    rating: number;
    avatarUrl?: string;
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
      />
    ))}
  </div>
);

export default function AvisClientsMarquee() {
    const { firestore } = useFirebase();
    const avisQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'avisClients'), orderBy('name')) : null, [firestore]);
    const { data: items, isLoading } = useCollection<AvisClient>(avisQuery);

    if (isLoading || !items || items.length === 0) {
        return null;
    }

    const duplicatedItems = [...items, ...items, ...items];

    return (
        <section className="py-16 sm:py-24 bg-background">
            <div className="container">
                 <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-8 text-left">
                    Ce que disent nos clients
                </h2>
            </div>
            <div className="relative flex overflow-x-hidden group">
                 <div className="animate-marquee group-hover:pause flex min-w-full shrink-0 items-center justify-around gap-8">
                    {duplicatedItems.map((item, index) => (
                        <NeumorphicCard key={`${item.id}-${index}`} className='w-[350px] shrink-0'>
                            <div className='flex flex-col items-center text-center'>
                                <Avatar className="h-20 w-20 mb-4 border-2 border-primary/10 p-1">
                                    <AvatarImage src={item.avatarUrl} alt={item.name} />
                                    <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <StarRating rating={item.rating} />
                                <p className="text-muted-foreground mt-4 text-sm italic">"{item.message}"</p>
                                <Separator className='my-4 w-1/4 mx-auto' />
                                <p className="font-semibold font-headline">{item.name}</p>
                            </div>
                        </NeumorphicCard>
                    ))}
                 </div>
                 <div className="absolute top-0 animate-marquee2 group-hover:pause flex min-w-full shrink-0 items-center justify-around gap-8">
                     {duplicatedItems.map((item, index) => (
                        <NeumorphicCard key={`${item.id}-2-${index}`} className='w-[350px] shrink-0'>
                             <div className='flex flex-col items-center text-center'>
                                <Avatar className="h-20 w-20 mb-4 border-2 border-primary/10 p-1">
                                    <AvatarImage src={item.avatarUrl} alt={item.name} />
                                    <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <StarRating rating={item.rating} />
                                <p className="text-muted-foreground mt-4 text-sm italic">"{item.message}"</p>
                                <Separator className='my-4 w-1/4 mx-auto' />
                                <p className="font-semibold font-headline">{item.name}</p>
                            </div>
                        </NeumorphicCard>
                    ))}
                 </div>
                 <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
                 <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
            </div>
        </section>
    );
}
