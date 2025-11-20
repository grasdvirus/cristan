
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
import { ArrowLeft, KeyRound, Plus, Trash2, Send, Loader2, PartyPopper, BarChart2, User, Trophy, Copy, Hourglass, LogOut, Gift, Facebook, Instagram, Linkedin, Twitter, Youtube, Globe } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AuthGuard } from '@/components/auth-guard';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const [motivation, setMotivation] = useState({ text: "", color: ""});
    
    useEffect(() => {
        setMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    }, []);

    const handleCopy = (textToCopy: string, type: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({ variant: 'success', title: `${type} copié !` });
    };
    
    const uses = partnerData.promoCodeUses || 0;
    const progress = Math.min((uses / REWARD_GOAL) * 100, 100);

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="relative text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Tableau de Bord Partenaire</h1>
                <p className="text-muted-foreground mt-2">Bienvenue, {partnerData.fullName} !</p>
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

const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Veuillez sélectionner une plateforme.'),
  username: z.string().min(1, 'Le nom d\'utilisateur est requis.'),
});

const partnerFormSchema = z.object({
  fullName: z.string().min(2, 'Le nom est requis.'),
  phone: z.string().min(8, 'Le numéro de téléphone est requis.'),
  socialLinks: z.array(socialLinkSchema).min(1, 'Ajoutez au moins un lien social.'),
  promoCode: z.string().min(3, 'Le code doit avoir au moins 3 caractères.').max(15, 'Le code ne doit pas dépasser 15 caractères.'),
});

type PartnerCodeValues = z.infer<typeof partnerCodeSchema>;
type PartnerFormValues = z.infer<typeof partnerFormSchema>;

const SnapchatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}><title>Snapchat</title><path d="M11.957 8.705c-.172.03-.34.08-.495.14-.316.12-.553.31-.69.54-.158.26-.208.56-.168.85.03.22.132.42.29.58.157.16.355.27.575.32.22.05.45.03.66-.05.336-.12.574-.31.71-.54.158-.26.208-.56.168-.85a.86.86 0 00-.288-.58.937.937 0 00-.573-.32.964.964 0 00-.279-.01zm.02 1.54c-.06.01-.12.01-.17.01-.06 0-.13 0-.19-.01a.34.34 0 01-.3-.3c0-.1.02-.2.07-.3.05-.09.11-.17.19-.22.08-.05.16-.08.25-.08.09 0 .18.02.26.06.16.08.28.23.3.4.03.17-.03.35-.16.46-.03.03-.07.05-.11.07-.01 0-.02.01-.04.01zM23.33 0c.34 0 .67.33.67.67v22.66c0 .34-.33.67-.67.67H.67C.33 24 0 23.67 0 23.33V.67C0 .33.33 0 .67 0h22.66m-1.74 4.88c-.28-.15-.7-.1-1.07.18-.32.25-.56.55-.75.88-.34.58-.6 1.22-.76 1.88l-1.63.14c0-.02-.01-.03-.01-.05a5.55 5.55 0 00-1.42-3.87c-.57-.6-1.28-1.04-2.06-1.32-.42-.15-.86-.22-1.3-.23a5.2 5.2 0 00-4.3 1.95c-.49.6-.82 1.34-1 2.13-.17.76-.23 1.55-.16 2.33.08.82.32 1.63.7 2.37.08.15.17.3.27.44.2.3.43.58.68.83.45.45 1 .8 1.6 1.05.53.22 1.1.33 1.67.33.82 0 1.62-.2 2.35-.55.6-.28 1.15-.68 1.6-1.16.5-.53.88-1.15 1.1-1.82.1-.3.17-.62.22-.94l.03-.23 1.7-.12c0 .01 0 .03.01.04.03.2.06.4.08.6.13 1.1.5 2.17 1.08 3.16.2.33.45.63.75.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.1-.3-.26-.58-.45-.83-.45-.6-1-1.1-1.5-1.6-.3-.3-.58-.6-.82-.93-.15-.22-.27-.45-.37-.7-.1-.24-.18-.48-.24-.73-.1-.4-.17-.8-.2-1.2l-.03-.3 1.7-.12c.16.6.4 1.18.72 1.7.2.33.45.63.75.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.1-.3-.26-.58-.45-.83-.45-.6-1-1.1-1.5-1.6-.2-.2-.3-.3-.3-.3v-.02c-.02-.02-.03-.04-.05-.06a4.01 4.01 0 00-.7-2.1c-.08-.18-.18-.35-.28-.52-.3-.5-.68-.94-1.1-1.32-.4-.36-.85-.65-1.34-.85-.52-.2-1.07-.3-1.63-.3-.42 0-.82.06-1.2.18-.38.12-.73.28-1.05.5-.6.4-1.1 1-1.48 1.66-.2.34-.36.7-.48 1.07-.12.38-.2.77-.25 1.16-.05.4-.07.8-.04 1.2l1.62.14c-.03-.2-.04-.4-.02-.6.03-.4.12-.8.27-1.16.15-.38.35-.73.6-1.05.25-.3.53-.56.84-.78.3-.22.63-.4.98-.52.3-.1.6-.15.9-.15.42 0 .82.06 1.2.18.38.12.73.28 1.05.5.6.4 1.1 1 1.48 1.66.2.34.36.7.48 1.07.12.38.2.77.25 1.16.05.4.07.8.04 1.2l-1.6.14c.06.4.15.8.27 1.17.12.36.28.7.48 1.02.2.3.4.58.67.82.26.24.55.45.85.6.3.17.62.3.94.38.3.08.6.12.9.12.55 0 1.1-.12 1.6-.33.5-.22.96-.52 1.36-.88.4-.36.75-.8 1.02-1.28.28-.5.48-1.02.6-1.55l-.02-.02 1.7-.1c.14.53.33 1.05.58 1.55.2.4.45.75.75.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.04-.15-.1-.3-.18-.44-.2-.33-.45-.63-.75-.88-.34-.3-.7-.56-1.1-.76-.37-.18-.76-.3-1.15-.38-.4-.08-.8-.12-1.2-.12-.7 0-1.38.13-2.02.4-.6.25-1.15.6-1.62 1.04-.5.45-.9 1-.12 1.55-.18.38-.3.78-.4 1.18-.1.4-.15.8-.18 1.2l-.02.2 1.7.12c0-.02.01-.03.01-.05.03-.2.06-.4.08-.6.13-1.1.5-2.17 1.08-3.16.2-.33.45-.63.75-.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.1-.3-.26-.58-.45-.83-.45-.6-1-1.1-1.5-1.6-.2-.2-.3-.3-.3-.3s0-.02-.02-.02a4.01 4.01 0 00-.7-2.1c-.08-.18-.18-.35-.28-.52-.3-.5-.68-.94-1.1-1.32-.4-.36-.85-.65-1.34-.85-.52-.2-1.07-.3-1.63-.3-.42 0-.82.06-1.2.18-.38.12-.73.28-1.05.5-.6.4-1.1 1-1.48 1.66-.2.34-.36.7-.48 1.07-.12.38-.2.77-.25 1.16-.05.4-.07.8-.04 1.2l1.62.14c-.03-.2-.04-.4-.02-.6.03-.4.12-.8.27-1.16.15-.38.35-.73.6-1.05.25-.3.53-.56.84-.78.3-.22.63-.4.98-.52.3-.1.6-.15.9-.15.42 0 .82.06 1.2.18.38.12.73.28 1.05.5.6.4 1.1 1 1.48 1.66.2.34.36.7.48 1.07.12.38.2.77.25 1.16.05.4.07.8.04 1.2l-1.6.14c.06.4.15.8.27 1.17.12.36.28.7.48 1.02.2.3.4.58.67.82.26.24.55.45.85.6.3.17.62.3.94.38.3.08.6.12.9.12.55 0 1.1-.12 1.6-.33.5-.22.96-.52 1.36-.88.4-.36.75-.8 1.02-1.28.28-.5.48-1.02.6-1.55l-.02-.02 1.7-.1c.14.53.33 1.05.58 1.55.2.4.45.75.75.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.04-.15-.1-.3-.18-.44-.2-.33-.45-.63-.75-.88-.34-.3-.7-.56-1.1-.76-.37-.18-.76-.3-1.15-.38-.4-.08-.8-.12-1.2-.12-.7 0-1.38.13-2.02.4-.6.25-1.15.6-1.62 1.04-.5.45-.9 1-.12 1.55-.18.38-.3.78-.4 1.18-.1.4-.15.8-.18 1.2l-.02.2 1.7.12c0-.02.01-.03.01-.05a5.48 5.48 0 001.17-6.35c.2-.33.45-.63.75-.88.2-.17.43-.26.68-.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.05-.16-.1-.3-.18-.45z"/></svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}><title>TikTok</title><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.86-.95-6.69-2.81-1.77-1.8-2.55-4.16-2.3-6.61.22-2.13 1.31-4.24 3.1-5.51 1.03-.71 2.22-1.1 3.49-1.16.02 2.84-.01 5.66.02 8.51.01.12.01.23.05.34.07.24.2.45.38.61.16.18.35.32.56.41.28.13.6.19.92.19.64 0 1.25-.22 1.75-.58.55-.38.9-1.01.9-1.68 0-.25-.03-.5-.08-.75l-.01-5.78z"/></svg>
);

const socialPlatforms = {
  instagram: { icon: Instagram, baseUrl: 'https://instagram.com/' },
  facebook: { icon: Facebook, baseUrl: 'https://facebook.com/' },
  linkedin: { icon: Linkedin, baseUrl: 'https://linkedin.com/in/' },
  twitter: { icon: Twitter, baseUrl: 'https://twitter.com/' },
  youtube: { icon: Youtube, baseUrl: 'https://youtube.com/' },
  tiktok: { icon: TikTokIcon, baseUrl: 'https://tiktok.com/@' },
  snapchat: { icon: SnapchatIcon, baseUrl: 'https://snapchat.com/add/' },
  website: { icon: Globe, baseUrl: '' },
};
type SocialPlatformKey = keyof typeof socialPlatforms;


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
      phone: '',
      socialLinks: [{ platform: 'instagram', username: '' }],
      promoCode: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });
  
  return (
    <NeumorphicCard className="w-full max-w-3xl mx-auto">
    <h2 className="text-2xl font-bold font-headline text-center mb-6">Formulaire de Partenariat</h2>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+225 01 02 03 04 05" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="md:col-span-2">
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
        </div>
        
        <div>
            <FormLabel>Réseaux Sociaux</FormLabel>
            <div className="space-y-2 mt-2">
            {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.platform`}
                      render={({ field }) => (
                          <FormItem className="w-1/3">
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                      <SelectTrigger className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
                                          <SelectValue placeholder="Plateforme" />
                                      </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                      {Object.entries(socialPlatforms).map(([key, { icon: Icon }]) => (
                                          <SelectItem key={key} value={key}>
                                              <div className="flex items-center gap-2">
                                                  <Icon className="h-4 w-4" />
                                                  <span className="capitalize">{key}</span>
                                              </div>
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name={`socialLinks.${index}.username`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input placeholder="Votre nom d'utilisateur" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive shrink-0 mt-1">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ platform: 'instagram', username: '' })}
            >
                <Plus className="mr-2 h-4 w-4" /> Ajouter un réseau
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


const PageWrapper = ({ children, showControls = false }: { children: React.ReactNode, showControls?: boolean }) => (
    <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="relative flex justify-between items-center mb-8">
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
            {showControls && (
                 <Button 
                    asChild
                    variant="ghost" 
                    size="icon"
                    className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                    aria-label="Demander une récompense"
                >
                    <Link href="/partner/reward">
                        <Gift className="h-5 w-5" />
                    </Link>
                </Button>
            )}
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
          phone: values.phone,
          socialLinks: values.socialLinks,
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
            return <PageWrapper showControls><PartnerDashboardContent partnerData={partnerData} userId={user.uid} /></PageWrapper>;
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
