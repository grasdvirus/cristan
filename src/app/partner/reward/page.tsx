
'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Share2, Info } from 'lucide-react';

import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { AuthGuard } from '@/components/auth-guard';
import { LoadingSpinner } from '@/components/loading-spinner';
import { doc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const rewardSchema = z.object({
  paymentMethod: z.string().min(1, "Veuillez choisir un mode de paiement."),
  paymentDetails: z.string().min(8, "Veuillez fournir les détails de paiement."),
  amount: z.coerce.number()
    .min(1000000, "Le montant minimum est de 1 000 000 FCFA.")
    .refine((value) => value % 1000000 === 0, {
      message: "Le montant doit être un multiple de 1 000 000 FCFA.",
    }),
});

type PartnerData = {
    id: string;
    fullName: string;
    promoCode: string;
};

function RewardForm() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();

    const partnerRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return doc(firestore, 'submissions', user.uid);
    }, [user, firestore]);
    const { data: partnerData, isLoading } = useDoc<PartnerData>(partnerRef);
    
    const form = useForm<z.infer<typeof rewardSchema>>({
        resolver: zodResolver(rewardSchema),
        defaultValues: {
            paymentMethod: '',
            paymentDetails: '',
            amount: 1000000,
        },
    });
    
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!partnerData) {
        return <p>Données partenaire non trouvées.</p>;
    }
    
    const whatsappLink = `https://wa.me/2250704542909`;

    return (
        <NeumorphicCard className="max-w-2xl mx-auto w-full">
            <div className="relative text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Demande de Récompense</h1>
                <p className="text-muted-foreground mt-2">
                    Remplissez le formulaire, prenez une capture d'écran, puis envoyez-la nous sur WhatsApp.
                </p>
            </div>
            
            <Form {...form}>
                <form className="space-y-6">
                    {/* ... form fields for partner data, amount, payment... */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Nom</Label>
                            <Input value={partnerData.fullName} disabled className="mt-1 neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                        </div>
                         <div>
                            <Label>Code Promo</Label>
                            <Input value={partnerData.promoCode} disabled className="mt-1 neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                        </div>
                    </div>
                     <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Montant demandé (FCFA)</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="text"
                                        placeholder="1.000.000"
                                        value={new Intl.NumberFormat('fr-FR').format(field.value)}
                                        readOnly
                                        className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark text-center font-mono" 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mode de Paiement</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
                                            <SelectValue placeholder="Choisir une option" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="wave">Wave</SelectItem>
                                        <SelectItem value="djamo">Djamo</SelectItem>
                                        <SelectItem value="orange_money">Orange Money</SelectItem>
                                        <SelectItem value="bank_transfer">Virement Bancaire</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="paymentDetails"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Détails de paiement
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder={"Numéro de téléphone ou IBAN"} 
                                        {...field}
                                        className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <div className="pt-4 space-y-4">
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Instructions</AlertTitle>
                          <AlertDescription>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Prenez une capture d'écran de ce formulaire rempli.</li>
                                <li>Cliquez sur le bouton ci-dessous pour ouvrir WhatsApp.</li>
                                <li>Envoyez-nous la capture d'écran.</li>
                            </ol>
                          </AlertDescription>
                        </Alert>
                        <Button 
                            type="button"
                            asChild 
                            size="lg"
                            className="w-full btn-neumorphic-light dark:btn-neumorphic-dark"
                        >
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <Share2 className="mr-2 h-4 w-4" />
                                Envoyer la capture sur WhatsApp
                            </a>
                        </Button>
                    </div>

                </form>
            </Form>
        </NeumorphicCard>
    );
}

function RewardPageContent() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="relative mb-8">
                <Button 
                    asChild
                    variant="ghost" 
                    size="icon"
                    className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                    aria-label="Retour au tableau de bord"
                >
                    <Link href="/partner/register">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
            </div>
            <RewardForm />
        </div>
    );
}

export default function RewardPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AuthGuard>
                <RewardPageContent />
            </AuthGuard>
        </Suspense>
    )
}
