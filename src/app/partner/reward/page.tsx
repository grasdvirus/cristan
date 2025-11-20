
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
import { ArrowLeft, Camera, Send, Plus, Minus, Share2 } from 'lucide-react';

import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { AuthGuard } from '@/components/auth-guard';
import { LoadingSpinner } from '@/components/loading-spinner';
import { doc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

const rewardSchema = z.object({
  paymentMethod: z.string().min(1, "Veuillez choisir un mode de paiement."),
  paymentDetails: z.string().min(8, "Veuillez fournir les détails de paiement."),
  amount: z.coerce.number()
    .min(1000000, "Le montant minimum est de 1 000 000 FCFA.")
    .refine((value) => value % 1000000 === 0, {
      message: "Le montant doit être un multiple de 1 000 000 FCFA.",
    }),
});

type RewardFormValues = z.infer<typeof rewardSchema>;

type PartnerData = {
    id: string;
    fullName: string;
    promoCode: string;
};

// Helper function for number formatting
const formatNumber = (value: number | string): string => {
    const num = String(value).replace(/\D/g, '');
    if (!num) return '0';
    return new Intl.NumberFormat('fr-FR').format(Number(num));
};


function RewardForm() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

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
            amount: 1000000,
        },
    });
    
    const paymentMethod = form.watch('paymentMethod');
    const amountValue = form.watch('amount');

    const handleAmountChange = (operation: 'increment' | 'decrement') => {
        const currentAmount = form.getValues('amount');
        const increment = 1000000;
        let newAmount = currentAmount;

        if (operation === 'increment') {
            newAmount += increment;
        } else {
            newAmount = Math.max(1000000, currentAmount - increment);
        }
        form.setValue('amount', newAmount, { shouldValidate: true });
    };

    const handleScreenshot = async () => {
        setIsCapturing(true);
        toast({
            title: 'Préparez-vous à capturer',
            description: 'Veuillez sélectionner la fenêtre ou l\'onglet de l\'application à partager.',
        });
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false,
            });

            const video = document.createElement('video');
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                if (context) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const url = canvas.toDataURL('image/png');
                    setScreenshotUrl(url);
                    toast({
                        variant: 'success',
                        title: 'Capture réussie !',
                        description: 'Vous pouvez maintenant envoyer la capture via WhatsApp.',
                    });
                }
                stream.getTracks().forEach(track => track.stop());
            };
        } catch (err: any) {
            console.error('Erreur de capture d\'écran:', err);
             // Don't show an error if the user just cancels the screen share prompt
            if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
                toast({
                    variant: 'destructive',
                    title: 'Capture échouée',
                    description: 'Assurez-vous d\'autoriser la capture d\'écran dans les paramètres de votre navigateur.',
                });
            }
        } finally {
            setIsCapturing(false);
        }
    };
    
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
                                   <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            className="btn-neumorphic-light dark:btn-neumorphic-dark"
                                            onClick={() => handleAmountChange('decrement')}
                                            disabled={amountValue <= 1000000}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <div className="flex-1 text-center font-mono text-lg p-2 rounded-md neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
                                            {formatNumber(amountValue)}
                                        </div>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            className="btn-neumorphic-light dark:btn-neumorphic-dark"
                                            onClick={() => handleAmountChange('increment')}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                   </div>
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

                    <div className="flex flex-col gap-4 items-center justify-center pt-4">
                        <Button 
                            type="button" 
                            onClick={handleScreenshot} 
                            disabled={isCapturing}
                            size="lg" 
                            className="w-full sm:w-auto btn-neumorphic-light dark:btn-neumorphic-dark"
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            {isCapturing ? 'Capture en cours...' : '1. Capture d\'écran'}
                        </Button>
                        
                        <Button 
                            type="button"
                            asChild 
                            size="lg"
                            className="w-full sm:w-auto btn-neumorphic-light dark:btn-neumorphic-dark"
                            disabled={!screenshotUrl}
                        >
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <Share2 className="mr-2 h-4 w-4" />
                                2. Envoyer sur WhatsApp
                            </a>
                        </Button>
                    </div>

                    {screenshotUrl && (
                        <div className="mt-6">
                             <Alert>
                                <AlertTitle>Aperçu de la capture</AlertTitle>
                                <AlertDescription>
                                    Voici l'image que vous avez capturée. Vous pouvez la télécharger ou la copier pour l'envoyer.
                                </AlertDescription>
                                <NeumorphicCard inset className="mt-4 p-2">
                                     <Image src={screenshotUrl} alt="Aperçu de la capture d'écran" width={800} height={450} className="rounded-md w-full h-auto" />
                                </NeumorphicCard>
                            </Alert>
                        </div>
                    )}
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
