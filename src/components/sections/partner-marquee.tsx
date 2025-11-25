
'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

type PartnerMarqueeItem = {
    id: string;
    name: string;
    emoji: string;
};

export default function PartnerMarquee() {
    const { firestore } = useFirebase();
    const marqueeQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'partnerMarqueeItems')) : null, [firestore]);
    const { data: items, isLoading } = useCollection<PartnerMarqueeItem>(marqueeQuery);

    if (isLoading || !items || items.length === 0) {
        return null;
    }

    const duplicatedItems = [...items, ...items, ...items, ...items];

    return (
        <div className="py-8 sm:py-12 bg-background">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline mb-8 text-center">
                Nos Partenaires
            </h2>
            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee group-hover:pause whitespace-nowrap flex items-center">
                    {duplicatedItems.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex items-center mx-8">
                            <span className="text-4xl filter grayscale">{item.emoji}</span>
                            <span className="ml-4 text-2xl font-bagel text-muted-foreground">{item.name}</span>
                        </div>
                    ))}
                </div>
                 <div className="absolute top-0 animate-marquee2 group-hover:pause whitespace-nowrap flex items-center">
                    {duplicatedItems.map((item, index) => (
                        <div key={`${item.id}-2-${index}`} className="flex items-center mx-8">
                            <span className="text-4xl filter grayscale">{item.emoji}</span>
                            <span className="ml-4 text-2xl font-bagel text-muted-foreground">{item.name}</span>
                        </div>
                    ))}
                 </div>
                 <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
                 <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
}
