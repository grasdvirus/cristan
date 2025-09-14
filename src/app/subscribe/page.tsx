

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Loader2, PartyPopper, Wallet, Crown, Check, ShieldCheck } from 'lucide-react';
import type { PaymentDetails } from '@/lib/payment';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { SubscriptionPlanId, SubscriptionPlans } from '@/lib/subscriptions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const subscriptionFormSchema = z.object({
  plan: z.enum(['24h', '1w', '1m'], { required_error: "Vous devez sélectionner un forfait." }),
  transactionId: z.string().min(10, { message: "Le message de transaction est requis." }),
});

export default function SubscribePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlans | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const form = useForm<z.infer<typeof subscriptionFormSchema>>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      plan: '1w',
      transactionId: "",
    },
  });
  const selectedPlan = form.watch('plan');

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/subscribe');
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const paymentResponse = await fetch('/api/payment/get');
        if (!paymentResponse.ok) throw new Error('Failed to fetch payment details');
        const paymentData = await paymentResponse.json();
        setPaymentDetails(paymentData);

        const plansDocRef = doc(db, 'config', 'subscriptionPlans');
        const plansDoc = await getDoc(plansDocRef);
        if (plansDoc.exists()) {
            setSubscriptionPlans(plansDoc.data() as SubscriptionPlans);
        } else {
            throw new Error("Subscription plans not configured");
        }

      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Erreur", description: "Impossible de charger les informations d'abonnement." });
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [toast]);

  async function onSubmit(values: z.infer<typeof subscriptionFormSchema>) {
    if (!user || !subscriptionPlans) {
        toast({ variant: 'destructive', title: "Erreur", description: "Vous devez être connecté pour vous abonner." });
        return;
    }

    setIsSubmitting(true);
    
    const subscriptionData = {
      userId: user.uid,
      userEmail: user.email,
      plan: values.plan,
      amount: subscriptionPlans[values.plan].price,
      transactionId: values.transactionId,
      createdAt: serverTimestamp(),
      status: 'pending',
    };
    
    // Grant 5 hours temporary access
    const tempExpiry = Timestamp.fromMillis(Date.now() + 5 * 60 * 60 * 1000);
    const userRef = doc(db, 'users', user.uid);

    try {
        await addDoc(collection(db, 'subscriptions'), subscriptionData);
        await setDoc(userRef, { subscriptionExpiry: tempExpiry }, { merge: true });
        
        setOrderComplete(true);
        toast({ title: "Demande reçue !", description: "Vous avez un accès temporaire de 5h. Nous confirmons votre paiement." });

    } catch (error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: "Erreur lors de la soumission",
            description: "Impossible d'enregistrer votre abonnement. Veuillez réessayer.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  if (orderComplete) {
    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-2xl text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full p-4 w-fit mb-4">
                       <PartyPopper className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="font-headline text-4xl text-green-600">Félicitations !</CardTitle>
                    <CardDescription className="text-lg">
                        Votre demande d'abonnement a été reçue. Vous bénéficiez d'un accès temporaire de 5 heures.
                        Une fois le paiement confirmé, votre accès complet sera activé.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button className="w-full" asChild>
                        <Link href="/decouvrir?category=tv">Commencer le visionnage</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="flex h-96 w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left Section - Plan selection and payment details */}
        <div className="space-y-6">
             <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className='border-b-0'>
                    <Card>
                        <AccordionTrigger className='p-4 hover:no-underline'>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                Confiance & Sécurité
                            </CardTitle>
                        </AccordionTrigger>
                         <AccordionContent className='p-4 pt-0'>
                            <div className="text-sm text-muted-foreground">
                                Avant de terminer le paiement veuillez lire nos informations sur la confidentialité pour votre sécurité. En savoir plus <Link href="/a-propos" className="underline hover:text-primary">à propos de nous</Link>.
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <Crown className="h-6 w-6 text-primary" />
                        Choisissez Votre Forfait
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form id="subscription-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                           {subscriptionPlans ? (
                            <FormField
                                control={form.control}
                                name="plan"
                                render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                    >
                                        {Object.values(subscriptionPlans).map((plan) => (
                                            <FormItem key={plan.id} className="flex-1">
                                                <FormControl>
                                                    <RadioGroupItem value={plan.id} id={plan.id} className="sr-only peer" />
                                                </FormControl>
                                                <Label
                                                htmlFor={plan.id}
                                                className={cn(
                                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 h-full hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                                    "peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                                )}
                                                >
                                                    <span className="font-bold text-lg mb-2">{plan.name}</span>
                                                    <span className="text-2xl font-headline text-primary mb-4">{new Intl.NumberFormat('fr-FR').format(plan.price)} FCFA</span>
                                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                                        {plan.features.map(f => <li key={f} className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" />{f}</li>)}
                                                    </ul>
                                                </Label>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                           ) : (
                             <p className="text-muted-foreground">Les forfaits ne sont pas disponibles pour le moment.</p>
                           )}
                             <Separator />
                             <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                                <p>Veuillez envoyer le montant de <strong className="text-primary">{subscriptionPlans ? new Intl.NumberFormat('fr-FR').format(subscriptionPlans[selectedPlan].price) : '...'} FCFA</strong> à l'un des contacts suivants :</p>
                                {paymentDetails ? (
                                    <div className="space-y-3 text-sm">
                                        {paymentDetails?.methods.map(method => (
                                            <div key={method.id} className="flex items-center gap-3">
                                                <div className="p-1 rounded-full" style={{ backgroundColor: `${method.color}20` }}>
                                                <Wallet className="h-4 w-4" style={{ color: method.color }}/>
                                                </div>
                                                <span><strong style={{ color: method.color }}>{method.name} :</strong> {method.details}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center h-16"><Loader2 className="h-6 w-6 animate-spin" /></div>
                                )}
                            </div>
                            <FormField control={form.control} name="transactionId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message de Transaction</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Copier-coller le message de transaction ici..." {...field} />
                                    </FormControl>
                                    <FormDescription>Après le paiement, collez ici le message complet reçu pour confirmer.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        {/* Right Section - Confirmation button */}
        <div className="space-y-6">
            <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle className="text-2xl">Confirmation</CardTitle>
                    <CardDescription>Une fois le paiement effectué et le formulaire rempli, soumettez votre demande.</CardDescription>
                </CardHeader>
                <CardFooter>
                     <Button type="submit" form="subscription-form" className="w-full py-3" disabled={isSubmitting || !subscriptionPlans}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Soumettre la Demande d'Abonnement
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
