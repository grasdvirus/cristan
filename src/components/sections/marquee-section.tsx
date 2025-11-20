'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Sparkles } from 'lucide-react';

type MarqueeItem = {
    id: string;
    text: string;
};

export default function MarqueeSection() {
    const { firestore } = useFirebase();
    const marqueeQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'marqueeItems')) : null, [firestore]);
    const { data: items, isLoading } = useCollection<MarqueeItem>(marqueeQuery);

    if (isLoading || !items || items.length === 0) {
        return null;
    }

    const duplicatedItems = [...items, ...items];

    return (
        <div className="relative flex overflow-x-hidden border-y bg-background neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
            <div className="py-3 animate-marquee whitespace-nowrap flex">
                {duplicatedItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center">
                        <span className="mx-8 text-sm font-semibold">{item.text}</span>
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background"></div>
        </div>
    );
}
