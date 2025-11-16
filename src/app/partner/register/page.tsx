
'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { useFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, KeyRound, Plus, Trash2, Send, Loader2, PartyPopper, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFieldArray } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AuthGuard } from '@/components/auth-guard';

const PARTNER_CODE = 'CRISTAN-PAT';

const partnerCodeSchema = z.object({
  code: z.string().min(1, "Le code est requis."),
});

const partnerFormSchema = z.object({
  fullName: z.string().min(2, 'Le nom est requis.'),
  email: z.string().email('Email invalide.'),
  phone: z.string().min(8, 'Numéro invalide.'),
  socialLinks: z.array(z.object({ value: z.string().url('URL invalide.') })).min(1, 'Ajoutez au moins un lien social.'),
  promoCode: z.string().min(3, 'Le code doit avoir au moins 3 caractères.').max(15, 'Le code ne doit pas dépasser 15 caractères.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
});

type PartnerCodeValues = z.infer<typeof partnerCodeSchema>;
type PartnerFormValues = z.infer<typeof partnerFormSchema>;

function PartnerCodeForm({ onCodeVerified }: { onCodeVerified: () => void }) {
    const { toast } = useToast();
    const form = useForm<PartnerCodeValues>({
        resolver: zodResolver(partnerCodeSchema),
        defaultValues: { code: "" }
    });

    const handleCodeSubmit = (values: PartnerCodeValues) => {
        if (values.code === PARTNER_CODE) {
            onCodeVerified();
            toast({
                variant: 'success',
                title: 'Code valide !',
                description: 'Vous pouvez maintenant remplir le formulaire.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Code invalide',
                description: 'Le code que vous avez entré est incorrect.',
            });
            form.setError("code", { message: "Code incorrect." });
        }
    };

    return (
        <div className="text-center px-4 sm:px-0">
            <div className="max-w-2xl mx-auto rounded-2xl">
                <div className="flex justify-center mb-6">
                    <NeumorphicCard className="rounded-full p-4">
                        <KeyRound className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </NeumorphicCard>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Accès au Programme Partenaire</h1>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                    Pour postuler, veuillez entrer le code d'accès qui vous a été fourni. Si vous n'en avez pas, <Link href="/about" className="text-primary underline">apprenez-en plus ici</Link>.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCodeSubmit)} className="mt-10 max-w-sm mx-auto space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="relative neumorphic-card-inset-light dark:neumorphic-card-inset-dark rounded-md">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Entrez votre code d'accès"
                                                className="bg-transparent border-none pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" size="lg" className="w-full btn-neumorphic-light dark:btn-neumorphic-dark font-bold text-lg">
                            Vérifier le code
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

function PartnerApplicationForm({ onFormSubmit, isSubmitting }: { onFormSubmit: (values: PartnerFormValues) => void, isSubmitting: boolean }) {
  const { user, isUserLoading } = useFirebase();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      socialLinks: [{ value: '' }],
      promoCode: '',
      password: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });
  
  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  return (
    <NeumorphicCard className="w-full max-w-2xl mx-auto">
    <h2 className="text-2xl font-bold font-headline text-center mb-6">Formulaire de Partenariat</h2>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                    <Input placeholder="Jean Dupont" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="promoCode"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Code Promo Suggeré</FormLabel>
                <FormControl>
                    <Input placeholder="EX: CRISTAN10" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="votre@email.com" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                    <Input type="tel" placeholder="+33 6..." {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Mot de passe pour votre espace partenaire</FormLabel>
                     <div className="relative">
                        <FormControl>
                            <Input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="Créez un mot de passe" {...field} 
                                className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark pr-10" />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-[9px] h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <div>
            <FormLabel>Réseaux Sociaux</FormLabel>
            <div className="space-y-2 mt-2">
            {fields.map((field, index) => (
                <FormField
                key={field.id}
                control={form.control}
                name={`socialLinks.${index}.value`}
                render={({ field }) => (
                    <FormItem>
                    <div className="flex items-center gap-2">
                        <FormControl>
                        <Input placeholder="https://linkedin.com/in/..." {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"/>
                        </FormControl>
                        {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        )}
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
            ))}
            </div>
            <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: '' })}
            >
            <Plus className="mr-2 h-4 w-4" /> Ajouter un lien
            </Button>
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="w-full sm:w-auto btn-neumorphic-light dark:btn-neumorphic-dark" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
            </Button>
        </div>
        </form>
    </Form>
    </NeumorphicCard>
  );
}


const PageWrapper = ({ children, showBackButton = true }: { children: React.ReactNode, showBackButton?: boolean }) => (
    <div className="container mx-auto px-4 py-16 sm:py-24 relative">
        {showBackButton && (
            <Button 
                asChild
                variant="ghost" 
                size="icon"
                className="absolute left-4 top-4 sm:left-6 sm:top-10 rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                aria-label="Retour"
            >
                <Link href="/partner">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
        )}
        {children}
    </div>
);

function PartnerRegistrationContent() {
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const router = useRouter();

  const handleFormSubmit = async (values: PartnerFormValues) => {
      if (!firestore || !user) {
        toast({ title: 'Erreur', description: 'Vous devez être connecté pour postuler.', variant: 'destructive' });
        return;
      }
      setIsSubmitting(true);
      try {
        const submissionDocRef = doc(firestore, 'submissions', user.uid);
        await setDoc(submissionDocRef, {
          ...values,
          socialLinks: values.socialLinks.map(link => link.value),
          type: 'Partenariat',
          userId: user.uid,
          status: 'en attente',
          promoCodeUses: 0,
          promoCodeTotalUses: 0,
          createdAt: serverTimestamp(),
          id: user.uid,
        });
        setShowSuccessDialog(true);
      } catch (error) {
        toast({ title: 'Erreur', description: 'Impossible d\'envoyer le formulaire.', variant: 'destructive'});
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
  };
  
  const handleDialogClose = (isOpen: boolean) => {
      setShowSuccessDialog(isOpen);
      if (!isOpen) {
          router.push('/partner/dashboard');
      }
  }

  return (
      <PageWrapper>
        {isCodeVerified ? (
            <PartnerApplicationForm onFormSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
        ) : (
            <PartnerCodeForm onCodeVerified={() => setIsCodeVerified(true)} />
        )}
         <Dialog open={showSuccessDialog} onOpenChange={handleDialogClose}>
            <DialogContent className="max-w-sm bg-transparent border-none shadow-none">
                <NeumorphicCard className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-300/20 via-blue-300/20 to-purple-300/20 animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute inset-0 sparkle-mask"></div>
                    <div className="relative flex flex-col items-center text-center py-8 px-4">
                        <DialogHeader>
                            <DialogTitle className="text-center text-2xl font-bold font-headline">Demande envoyée !</DialogTitle>
                        </DialogHeader>
                        <div className="text-7xl my-6 animate-bounce">
                            <PartyPopper className="h-20 w-20 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Nous avons bien reçu vos informations. Vous serez redirigé vers votre page d'attente.
                        </p>
                        <Button 
                            onClick={() => handleDialogClose(false)} 
                            className="mt-8 btn-neumorphic-light dark:btn-neumorphic-dark"
                        >
                            Fermer
                        </Button>
                    </div>
                </NeumorphicCard>
            </DialogContent>
        </Dialog>
      </PageWrapper>
  );
}

export default function PartnerRegisterPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AuthGuard>
                <PartnerRegistrationContent />
            </AuthGuard>
        </Suspense>
    )
}
