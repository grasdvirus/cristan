'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Handshake, ArrowRight, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

const PARTNER_CODE = 'CRISTAN-PAT';

export default function PartnerPage() {
  const [code, setCode] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PARTNER_CODE) {
      router.push('/contract?type=partner');
    } else if (code) {
        toast({
            variant: 'destructive',
            title: 'Code invalide',
            description: 'Le code que vous avez entré est incorrect.',
        });
    } else {
       router.push('/contract');
    }
  };


  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <NeumorphicCard className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <NeumorphicCard className="rounded-full p-4">
            <Handshake className="w-16 h-16 text-primary" />
          </NeumorphicCard>
        </div>
        <h1 className="text-4xl font-bold font-headline">Devenez Partenaire</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Rejoignez notre écosystème et collaborons pour créer de la valeur. Si
          vous avez un code de partenariat, entrez-le ci-dessous. Sinon,
          cliquez sur "Devenir partenaire" pour soumettre une demande
          standard.
        </p>

        <form onSubmit={handleCodeSubmit} className="mt-10 max-w-sm mx-auto space-y-4">
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Entrez votre code partenaire (optionnel)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark pl-10"
                />
            </div>
          
            <Button type="submit" size="lg" className="w-full btn-neumorphic-light dark:btn-neumorphic-dark font-bold text-lg">
                Soumettre
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </form>
         <p className="text-xs text-muted-foreground mt-4">En cliquant sur "Soumettre" sans code, vous serez dirigé vers le formulaire de contact général.</p>
      </NeumorphicCard>
    </div>
  );
}
