
'use client';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Handshake, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PartnerPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <NeumorphicCard className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
            <NeumorphicCard className='rounded-full p-4'>
                <Handshake className="w-16 h-16 text-primary" />
            </NeumorphicCard>
        </div>
        <h1 className="text-4xl font-bold font-headline">Devenez Partenaire</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Rejoignez notre écosystème et collaborons pour créer de la valeur. Nous sommes toujours à la recherche de partenaires passionnés pour grandir avec nous. Que vous soyez créateur, développeur ou une entreprise, nous avons une place pour vous.
        </p>
        <div className="mt-10">
            <Button asChild size="lg" className="btn-neumorphic-light dark:btn-neumorphic-dark font-bold text-lg">
                <Link href="/contract">
                    Devenir partenaire
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </NeumorphicCard>
    </div>
  );
}
