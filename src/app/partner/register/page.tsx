
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, KeyRound, Plus, Trash2, Send, Loader2, PartyPopper, BarChart2, User, Trophy, Copy, Hourglass, LogOut } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AuthGuard } from '@/components/auth-guard';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


// ========= Dashboard Components =========

const REWARD_GOAL = 100;

const motivationalMessages = [
    { text: "Chaque code partagé vous rapproche du succès ! 💪", color: "text-green-500" },
    { text: "Continuez comme ça, vous êtes une star ! ⭐", color: "text-yellow-500" },
    { text: "Votre influence grandit à chaque utilisation. 🚀", color: "text-blue-500" },
    { text: "L'excellence est une habitude. Ne lâchez rien ! ✨", color: "text-purple-500" },
    { text: "Plus que quelques pas avant la récompense ! 🎉", color: "text-pink-500" },
];

type PartnerData = {
    id: string;
    fullName: string;
    promoCode: string;
    promoCodeUses: number;
    promoCodeTotalUses: number;
    status: 'en attente' | 'confirmé' | 'refusé';
};

function PartnerDashboardContent({ partnerData, userId }: { partnerData: PartnerData, userId: string }) {
    const router = useRouter();
    const { toast } = useToast();
    const { auth, firestore } = useFirebase();
    const [motivation, setMotivation] = useState({ text: "", color: ""});
    
    useEffect(() => {
        setMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    }, []);

    const handleCopy = (textToCopy: string, type: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({ variant: 'success', title: `${type} copié !` });
    };

    const handleDeleteAccount = async () => {
        if (!firestore) return;
        const docRef = doc(firestore, 'submissions', userId);
        try {
            await deleteDoc(docRef);
            toast({ variant: 'success', title: "Compte supprimé", description: "Votre compte partenaire a été supprimé." });
            // The component will unmount and re-render the form.
        } catch(e) {
            console.error(e)
            toast({ variant: 'destructive', title: "Erreur", description: "Impossible de supprimer le compte." });
        }
    };
    
    const uses = partnerData.promoCodeUses || 0;
    const progress = Math.min((uses / REWARD_GOAL) * 100, 100);

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="relative text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Tableau de Bord Partenaire</h1>
                <p className="text-muted-foreground mt-2">Bienvenue, {partnerData.fullName} !</p>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-0 right-0 rounded-full"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer le compte</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action est irréversible. Votre compte partenaire et toutes les données associées seront définitivement supprimés. Vous pourrez créer un nouveau compte si vous le souhaitez.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount}>
                                Oui, supprimer mon compte
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <NeumorphicCard inset className="p-6 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105">
                    <User className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-lg font-semibold">Votre Code Promo</h3>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-primary my-2 flex items-center gap-2">
                        <span>{partnerData.promoCode}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(partnerData.promoCode || '', 'Code')} className="h-8 w-8 rounded-full">
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Partagez ce code pour gagner des commissions.</p>
                </NeumorphicCard>
                <NeumorphicCard inset className="p-6 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105">
                    <BarChart2 className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-lg font-semibold">Utilisations Totales (à vie)</h3>
                    <p className="text-3xl font-bold font-mono text-primary my-2">{partnerData.promoCodeTotalUses || 0}</p>
                    <p className="text-sm text-muted-foreground">Nombre total d'achats avec votre code.</p>
                </NeumorphicCard>
            </div>
            
            <NeumorphicCard>
                <div className="flex items-center gap-4 mb-4">
                    <Trophy className="w-8 h-8 text-primary animate-pulse"/>
                    <h2 className="text-2xl font-bold font-headline">Prochaine Récompense</h2>
                </div>
                <div className="text-center my-4">
                    <span className="text-4xl font-bold">{uses}</span>
                    <span className="text-xl text-muted-foreground"> / {REWARD_GOAL}</span>
                    <p className="text-sm text-muted-foreground mt-1">utilisations avant la prochaine récompense</p>
                </div>
                <Progress value={progress} className="w-full h-4" />
                <div className="text-center mt-4 h-6">
                    <p className={cn("font-semibold", motivation.color)}>{motivation.text}</p>
                </div>
            </NeumorphicCard>
        </div>
    );
}

// ========= Registration Form Components =========

const PARTNER_CODE = 'CRISTAN-PAT';

const partnerCodeSchema = z.object({
  code: z.string().min(1, "Le code est requis."),
});

const partnerFormSchema = z.object({
  fullName: z.string().min(2, 'Le nom est requis.'),
  socialLinks: z.array(z.object({ value: z.string().url('URL invalide.') })).min(1, 'Ajoutez au moins un lien social.'),
  promoCode: z.string().min(3, 'Le code doit avoir au moins 3 caractères.').max(15, 'Le code ne doit pas dépasser 15 caractères.'),
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
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

function PartnerApplicationForm({ onFormSubmit, isSubmitting }: { onFormSubmit: (values: PartnerFormValues) => void, isSubmitting: boolean }) {
  const { user } = useFirebase();
  
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      socialLinks: [{ value: '' }],
      promoCode: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });
  
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


const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-16 sm:py-24 relative">
        <div className="absolute left-4 top-4 sm:left-6 sm:top-10">
            <Button 
                asChild
                variant="ghost" 
                size="icon"
                className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                aria-label="Retour"
            >
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
        </div>
        <div className="flex justify-center items-center min-h-[60vh]">
            {children}
        </div>
    </div>
);

function PartnerPortalContent() {
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const partnerRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return doc(firestore, 'submissions', user.uid);
  }, [user, firestore]);

  const { data: partnerData, isLoading } = useDoc<PartnerData>(partnerRef);

  const handleFormSubmit = async (values: PartnerFormValues) => {
      if (!firestore || !user) {
        toast({ title: 'Erreur', description: 'Vous devez être connecté pour postuler.', variant: 'destructive' });
        return;
      }
      setIsSubmitting(true);
      
      const submissionData = {
          fullName: values.fullName,
          email: user.email,
          phone: user.phoneNumber || 'N/A', // Add phone if available
          socialLinks: values.socialLinks.map(link => link.value),
          promoCode: values.promoCode,
          type: 'Partenariat',
          userId: user.uid,
          status: 'en attente' as const,
          promoCodeUses: 0,
          promoCodeTotalUses: 0,
          createdAt: serverTimestamp(),
          id: user.uid,
        };

      const submissionDocRef = doc(firestore, 'submissions', user.uid);
      
      setDoc(submissionDocRef, submissionData, { merge: true })
        .then(() => {
            toast({ variant: 'success', title: 'Demande envoyée !', description: 'Nous examinons votre profil.'});
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: submissionDocRef.path,
                operation: 'create',
                requestResourceData: submissionData,
            });
            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setIsSubmitting(false);
        });
  };
  
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // SCENARIO 1: User has a submission record
    if (partnerData) {
        if (partnerData.status === 'confirmé' && user) {
            // SHOW DASHBOARD
            return <PageWrapper><PartnerDashboardContent partnerData={partnerData} userId={user.uid} /></PageWrapper>;
        } else {
            // SHOW PENDING / REJECTED STATUS
            return (
                <PageWrapper>
                    <div className="max-w-xl mx-auto text-center">
                        <NeumorphicCard>
                            <Hourglass className="w-16 h-16 mx-auto text-primary mb-6" />
                            <h1 className="text-2xl font-bold font-headline">
                                {partnerData.status === 'en attente' ? "Demande en cours d'examen" : "Demande refusée"}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                            {partnerData.status === 'en attente' 
                                ? "Merci pour votre demande ! Votre compte partenaire est en cours de vérification par notre équipe. Vous serez notifié par e-mail une fois votre compte approuvé."
                                : "Malheureusement, votre demande de partenariat n'a pas été approuvée pour le moment. Pour plus d'informations, veuillez nous contacter."
                            }
                            </p>
                        </NeumorphicCard>
                    </div>
                </PageWrapper>
            );
        }
    }

    // SCENARIO 2: User does NOT have a submission record
    return (
        <PageWrapper>
            {isCodeVerified ? (
                <PartnerApplicationForm onFormSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
            ) : (
                <PartnerCodeForm onCodeVerified={() => setIsCodeVerified(true)} />
            )}
        </PageWrapper>
    );
}

export default function PartnerRegisterPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AuthGuard>
                <PartnerPortalContent />
            </AuthGuard>
        </Suspense>
    )
}
