
'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, where, doc, updateDoc, increment } from 'firebase/firestore';
import Link from 'next/link';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Handshake, ArrowRight, KeyRound, Plus, Trash2, Send, Loader2, BarChart2, User, Trophy, Copy, Edit, ArrowLeft, PartyPopper, Clock } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ContractSubmission } from '@/app/admin/page';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useRouter } from 'next/navigation';

const PARTNER_CODE = 'CRISTAN-PAT';
const REWARD_GOAL = 100;

const partnerCodeSchema = z.object({
  code: z.string().min(1, "Le code est requis."),
});

const partnerFormSchema = z.object({
  fullName: z.string().min(2, 'Le nom est requis.'),
  email: z.string().email('Email invalide.'),
  phone: z.string().min(8, 'Numéro invalide.'),
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
            <div className="sm:neumorphic-card-light sm:dark:neumorphic-card-dark max-w-2xl mx-auto sm:p-8 rounded-2xl">
                <div className="flex justify-center mb-6">
                    <NeumorphicCard className="rounded-full p-4">
                        <Handshake className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </NeumorphicCard>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Devenez Partenaire</h1>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                    Pour accéder au formulaire de partenariat, veuillez entrer le code d'accès qui vous a été fourni. Si vous n'en avez pas, <Link href="/about" className="text-primary underline">apprenez-en plus ici</Link>.
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
                                                placeholder="Entrez votre code partenaire"
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
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      socialLinks: [{ value: '' }],
      promoCode: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  return (
    <NeumorphicCard className="w-full max-w-2xl mx-auto mt-12">
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

const motivationalMessages = [
    { text: "Chaque code partagé vous rapproche du succès ! 💪", color: "text-green-500" },
    { text: "Continuez comme ça, vous êtes une star ! ⭐", color: "text-yellow-500" },
    { text: "Votre influence grandit à chaque utilisation. 🚀", color: "text-blue-500" },
    { text: "L'excellence est une habitude. Ne lâchez rien ! ✨", color: "text-purple-500" },
    { text: "Plus que quelques pas avant la récompense ! 🎉", color: "text-pink-500" },
];

const congratsEmojis = ['🎉', '🥳', '🎊', '🤩', '🚀', '💯'];


function PartnerDashboard({ partner }: { partner: ContractSubmission }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const uses = partner.promoCodeUses || 0;
    const progress = Math.min((uses / REWARD_GOAL) * 100, 100);
    const [motivation, setMotivation] = useState({ text: "", color: ""});
    const [isEditingCode, setIsEditingCode] = useState(false);
    const [newCode, setNewCode] = useState(partner.promoCode || '');
    const [isSavingCode, setIsSavingCode] = useState(false);
    
    const [congratsData, setCongratsData] = useState<{ open: boolean; increase: number, emoji: string }>({ open: false, increase: 0, emoji: '🎉' });
    const prevUses = useRef<number | undefined>(partner.promoCodeUses);


    useEffect(() => {
        setMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    }, [partner.promoCodeUses]);

    useEffect(() => {
        const currentUses = partner.promoCodeUses;
        if (prevUses.current !== undefined && currentUses !== undefined && currentUses > prevUses.current) {
            const increase = currentUses - prevUses.current;
            if (increase > 0) {
                 const randomEmoji = congratsEmojis[Math.floor(Math.random() * congratsEmojis.length)];
                 setCongratsData({ open: true, increase, emoji: randomEmoji });
            }
        }
        prevUses.current = currentUses;
    }, [partner.promoCodeUses]);
    
    const handleCopyCode = () => {
        if (partner.promoCode) {
            navigator.clipboard.writeText(partner.promoCode);
            toast({ variant: 'success', title: 'Code copié !' });
        }
    };
    
    const handleSaveCode = async () => {
        if (!firestore || !partner.promoCode || newCode.trim() === '' || newCode.trim() === partner.promoCode) {
            setIsEditingCode(false);
            return;
        }
        setIsSavingCode(true);
        try {
            const partnerRef = doc(firestore, 'submissions', partner.id);
            await updateDoc(partnerRef, { promoCode: newCode.trim() });
            toast({ variant: 'success', title: 'Code promo mis à jour !' });
            setIsEditingCode(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le code.' });
            console.error(error);
        } finally {
            setIsSavingCode(false);
        }
    }


    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Tableau de Bord Partenaire</h1>
                <p className="text-muted-foreground mt-2">Bienvenue, {partner.fullName} !</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <NeumorphicCard inset className="p-6 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105">
                    <User className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-lg font-semibold">Votre Code Promo</h3>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-primary my-2 flex items-center gap-2">
                        <span>{partner.promoCode}</span>
                        <Button variant="ghost" size="icon" onClick={handleCopyCode} className="h-8 w-8 rounded-full">
                            <Copy className="h-4 w-4"/>
                        </Button>
                         <Dialog open={isEditingCode} onOpenChange={setIsEditingCode}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <Edit className="h-4 w-4"/>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Modifier votre code promo</DialogTitle>
                                </DialogHeader>
                                <Input 
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value)}
                                    placeholder="Nouveau code promo"
                                    className="my-4"
                                />
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditingCode(false)}>Annuler</Button>
                                    <Button onClick={handleSaveCode} disabled={isSavingCode}>
                                        {isSavingCode ? <Loader2 className="animate-spin"/> : 'Sauvegarder'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <p className="text-sm text-muted-foreground">Partagez ce code pour gagner des commissions.</p>
                </NeumorphicCard>
                <NeumorphicCard inset className="p-6 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105">
                    <BarChart2 className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-lg font-semibold">Utilisations Totales (à vie)</h3>
                     <p className="text-3xl font-bold font-mono text-primary my-2">{partner.promoCodeTotalUses || 0}</p>
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

            <Dialog open={congratsData.open} onOpenChange={(open) => setCongratsData(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-sm bg-transparent border-none shadow-none">
                    <NeumorphicCard className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-300/20 via-blue-300/20 to-purple-300/20 animate-[spin_20s_linear_infinite]"></div>
                        <div className="absolute inset-0 sparkle-mask"></div>
                        
                        <div className="relative flex flex-col items-center text-center py-8 px-4">
                            <DialogHeader>
                                <DialogTitle className="text-center text-2xl font-bold font-headline">Félicitations !</DialogTitle>
                            </DialogHeader>
                            <div className="text-7xl my-6 animate-bounce">
                                {congratsData.emoji}
                            </div>
                            <p className="text-lg text-foreground">
                                Vous avez enregistré <span className="font-bold text-primary">{congratsData.increase}</span> nouvel(s) achat(s) !
                            </p>
                            <Button 
                                onClick={() => setCongratsData({ open: false, increase: 0, emoji: '🎉' })} 
                                className="mt-8 btn-neumorphic-light dark:btn-neumorphic-dark"
                            >
                                Continuer
                            </Button>
                        </div>
                    </NeumorphicCard>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function PendingApprovalView() {
    return (
        <div className="text-center px-4 sm:px-0">
            <NeumorphicCard className="max-w-2xl mx-auto p-8">
                <div className="flex justify-center mb-6">
                    <NeumorphicCard className="rounded-full p-4">
                        <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </NeumorphicCard>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Demande en cours d'examen</h1>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                    Merci pour votre demande ! Nous l'examinons et reviendrons vers vous rapidement. Une fois approuvée, vous aurez accès à votre tableau de bord partenaire sur cette page.
                </p>
                <Button asChild className="mt-8 btn-neumorphic-light dark:btn-neumorphic-dark">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à l'accueil
                    </Link>
                </Button>
            </NeumorphicCard>
        </div>
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
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
        )}
        {children}
    </div>
);

type PartnerStatus = 'loading' | 'partner' | 'pending' | 'not_partner';

function PartnerPageContent() {
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();
  const { firestore, user, isUserLoading } = useFirebase();
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus>('loading');
  const [partnerData, setPartnerData] = useState<ContractSubmission | null>(null);
  const router = useRouter();

  const partnerQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'submissions'),
        where('userId', '==', user.uid),
        where('type', '==', 'Partenariat')
    );
  }, [firestore, user]);

  const { data: partnerSubmissions, isLoading: isPartnerLoading } = useCollection<ContractSubmission>(partnerQuery);
  
  useEffect(() => {
    if (!user || isPartnerLoading) return;

    if (partnerSubmissions && partnerSubmissions.length > 0) {
        const confirmedPartner = partnerSubmissions.find(s => s.status === 'confirmé');
        if (confirmedPartner) {
            setPartnerStatus('partner');
            setPartnerData(confirmedPartner);
            return;
        }
        
        const pendingPartner = partnerSubmissions.find(s => s.status === 'en attente');
        if (pendingPartner) {
            setPartnerStatus('pending');
            return;
        }
    }
    setPartnerStatus('not_partner');

  }, [user, partnerSubmissions, isPartnerLoading]);


  const handleFormSubmit = async (values: PartnerFormValues) => {
      if (!firestore) {
        toast({ title: 'Erreur de base de données', variant: 'destructive' });
        return;
      }
      if (!user) {
        toast({ title: 'Connexion requise', description: 'Veuillez vous connecter pour devenir partenaire.', variant: 'destructive' });
        router.push('/login?redirect=/partner');
        return;
      }
      setIsSubmitting(true);
      try {
        await addDoc(collection(firestore, 'submissions'), {
          ...values,
          socialLinks: values.socialLinks.map(link => link.value),
          type: 'Partenariat',
          userId: user.uid,
          status: 'en attente',
          promoCodeUses: 0,
          promoCodeTotalUses: 0,
          createdAt: serverTimestamp(),
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
          setPartnerStatus('pending');
      }
  }

  if (isUserLoading || partnerStatus === 'loading') {
      return <LoadingSpinner />;
  }

  if (partnerStatus === 'partner' && partnerData) {
    return <PageWrapper showBackButton={false}><PartnerDashboard partner={partnerData} /></PageWrapper>;
  }

  if (partnerStatus === 'pending') {
      return <PageWrapper><PendingApprovalView /></PageWrapper>;
  }
  
  // This view is for:
  // 1. Anonymous users.
  // 2. Logged-in users who are 'not_partner'.
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
                          Nous avons bien reçu vos informations et examinerons votre demande bientôt.
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

export default function PartnerPage() {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <PartnerPageContent />
      </Suspense>
    )
}
