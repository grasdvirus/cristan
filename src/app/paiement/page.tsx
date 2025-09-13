

'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/hooks/use-cart-store';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Loader2, PartyPopper, Wallet } from 'lucide-react';
import type { PaymentDetails } from '@/lib/payment';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const paymentFormSchema = z.object({
  customerName: z.string().min(2, { message: "Le nom complet est requis." }),
  customerEmail: z.string().email({ message: "Une adresse email valide est requise." }),
  customerPhone: z.string().min(8, { message: "Le numéro de téléphone est requis." }),
  transactionId: z.string().min(4, { message: "L'ID de transaction est requis." }),
  customerNotes: z.string().optional(),
});


export default function PaiementPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Check if cart contains any physical product
  const hasPhysicalProduct = items.some(item => !!item.collection);
  const deliveryFee = hasPhysicalProduct ? 5000 : 0;
  const finalTotal = total + deliveryFee;

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: user?.email || "",
      customerPhone: "",
      transactionId: "",
      customerNotes: "",
    },
  });

  useEffect(() => {
    if (user?.email) {
      form.setValue('customerEmail', user.email);
    }
  }, [user, form]);

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0 && !orderComplete) {
      router.replace('/decouvrir');
    }
  }, [items, orderComplete, router]);

  useEffect(() => {
    // Fetch payment details
    async function fetchDetails() {
      try {
        setLoadingDetails(true);
        const response = await fetch('/api/payment/get');
        if (!response.ok) throw new Error('Failed to fetch payment details');
        const data = await response.json();
        setPaymentDetails(data);
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Erreur", description: "Impossible de charger les détails de paiement." });
      } finally {
        setLoadingDetails(false);
      }
    }
    fetchDetails();
  }, [toast]);

  async function onSubmit(values: z.infer<typeof paymentFormSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: "Erreur", description: "Vous devez être connecté pour passer une commande." });
        return;
    }

    setIsSubmitting(true);
    
    // Sanitize items before saving
    const sanitizedItems = items.map(({ id, title, price, collection, internetClass }) => ({
        id,
        title,
        price,
        ...(collection && { collection }),
        ...(internetClass && { internetClass }),
    }));
    
    const orderData = {
      ...values,
      items: sanitizedItems,
      totalAmount: finalTotal,
      createdAt: serverTimestamp(),
      status: 'pending',
    };

    try {
        await addDoc(collection(db, 'orders'), orderData);
        setOrderComplete(true);
        clearCart();
    } catch (error: any) {
        console.error(error);
        const description = error.code === 'permission-denied'
            ? "Permission refusée. Vérifiez vos règles de sécurité Firestore."
            : "Impossible d'enregistrer votre commande. Veuillez réessayer.";
        
        toast({
            variant: 'destructive',
            title: "Erreur lors de la soumission",
            description: description,
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
                    <CardTitle className="font-headline text-4xl text-green-600">Merci pour votre commande !</CardTitle>
                    <CardDescription className="text-lg">Votre commande a été reçue et est en cours de traitement. Vous recevrez bientôt une confirmation.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button className="w-full" asChild>
                        <Link href="/">Retour à l'accueil</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }


  return (
    <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="lg:col-span-3 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <Mail className="h-6 w-6 text-primary" />
                        Paiement Manuel
                    </CardTitle>
                    <CardDescription>Pour finaliser votre commande, veuillez effectuer un transfert via l'un des services ci-dessous.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingDetails ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                            <p>Veuillez envoyer le montant total de <strong className="text-primary">{new Intl.NumberFormat('fr-FR').format(finalTotal)} FCFA</strong> à l'un des contacts suivants :</p>
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
                            <p className="text-xs text-muted-foreground pt-2">Après le paiement, veuillez remplir et soumettre le formulaire avec vos informations de livraison. Nous vous contacterons pour confirmer.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-2xl">Vos informations</CardTitle></CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form id="payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField control={form.control} name="customerName" render={({ field }) => (
                                <FormItem><FormLabel>Nom complet</FormLabel><FormControl><Input placeholder="Prénom et Nom" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="customerEmail" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="votre.email@exemple.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="customerPhone" render={({ field }) => (
                                <FormItem><FormLabel>Numéro de téléphone</FormLabel><FormControl><Input placeholder="+225 0102030405" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="transactionId" render={({ field }) => (
                                <FormItem><FormLabel>ID de la Transaction</FormLabel><FormControl><Input placeholder="ID reçu après le transfert" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="customerNotes" render={({ field }) => (
                                <FormItem><FormLabel>Note de commande (Optionnel)</FormLabel><FormControl><Textarea placeholder="Instructions spéciales, informations supplémentaires..." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle className="text-2xl">Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {item.imageUrls && item.imageUrls.length > 0 && (
                                    <Image src={item.imageUrls[0]} alt={item.title} fill className="object-cover" />
                                    )}
                                </div>
                                <div>
                                    <span className="font-semibold">{item.title}</span>
                                    <p className="text-sm text-muted-foreground">Qté: 1</p>
                                </div>
                            </div>
                            <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(item.price)} FCFA</span>
                        </div>
                    ))}
                    <Separator />
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span>Sous-total</span>
                            <span>{new Intl.NumberFormat('fr-FR').format(total)} FCFA</span>
                        </div>
                        {hasPhysicalProduct && (
                            <div className="flex justify-between items-center">
                                <span>Livraison</span>
                                <span>{new Intl.NumberFormat('fr-FR').format(deliveryFee)} FCFA</span>
                            </div>
                        )}
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat('fr-FR').format(finalTotal)} FCFA</span>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button type="submit" form="payment-form" className="w-full py-3" disabled={isSubmitting || items.length === 0}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Soumettre la commande
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
