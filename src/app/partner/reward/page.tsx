
'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Send } from 'lucide-react';

import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { AuthGuard } from '@/components/auth-guard';
import { LoadingSpinner } from '@/components/loading-spinner';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

const rewardSchema = z.object({
  paymentMethod: z.string().min(1, "Veuillez choisir un mode de paiement."),
  paymentDetails: z.string().min(8, "Veuillez fournir les détails de paiement."),
  amount: z.coerce.number().min(1, "Le montant doit être supérieur à 0."),
});

type RewardFormValues = z.infer<typeof rewardSchema>;

type PartnerData = {
    id: string;
    fullName: string;
    promoCode: string;
};

function RewardForm() {
    const { firestore, user } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const partnerRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return doc(firestore, 'submissions', user.uid);
    }, [user, firestore]);
    const { data: partnerData, isLoading } = useDoc<PartnerData>(partnerRef);
    
    const form = useForm<RewardFormValues>({
        resolver: zodResolver(rewardSchema),
        defaultValues: {
            paymentMethod: '',
            paymentDetails: '',
            amount: 0,
        },
    });
    
    const paymentMethod = form.watch('paymentMethod');

    const onSubmit = async (values: RewardFormValues) => {
        if (!firestore || !user || !partnerData) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de soumettre la demande.' });
            return;
        }
        setIsSubmitting(true);

        try {
            await addDoc(collection(firestore, 'rewardRequests'), {
                ...values,
                userId: user.uid,
                userName: partnerData.fullName,
                promoCode: partnerData.promoCode,
                status: 'en attente',
                createdAt: serverTimestamp(),
            });
            toast({ variant: 'success', title: 'Demande envoyée !', description: 'Votre demande de récompense est en cours de traitement.' });
            router.push('/partner/register');
        } catch (error) {
            console.error("Error submitting reward request:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: "Une erreur s'est produite lors de l'envoi." });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!partnerData) {
        return <p>Données partenaire non trouvées.</p>;
    }

    return (
        <NeumorphicCard className="max-w-2xl mx-auto w-full">
            <div className="relative text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Demande de Récompense</h1>
                <p className="text-muted-foreground mt-2">
                    Remplissez le formulaire pour recevoir votre paiement. Voulez-vous retirer les 1.000.000 F des 100 entrées par votre code promo ?
                </p>
            </div>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                    <Input type="number" placeholder="5000" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"/>
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

                    {paymentMethod && (
                        <FormField
                            control={form.control}
                            name="paymentDetails"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {paymentMethod === 'bank_transfer' ? 'Détails du compte (IBAN)' : 'Numéro de téléphone'}
                                    </FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder={paymentMethod === 'bank_transfer' ? 'CI00 ...' : '07...'} 
                                            {...field}
                                            className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting} size="lg" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Envoyer la demande
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
