
'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart2, User, Trophy, Copy, ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { ContractSubmission } from '@/app/admin/page';

const REWARD_GOAL = 100;

const motivationalMessages = [
    { text: "Chaque code partagé vous rapproche du succès ! 💪", color: "text-green-500" },
    { text: "Continuez comme ça, vous êtes une star ! ⭐", color: "text-yellow-500" },
    { text: "Votre influence grandit à chaque utilisation. 🚀", color: "text-blue-500" },
    { text: "L'excellence est une habitude. Ne lâchez rien ! ✨", color: "text-purple-500" },
    { text: "Plus que quelques pas avant la récompense ! 🎉", color: "text-pink-500" },
];

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


function PartnerDashboard({ partnerData }: { partnerData: ContractSubmission }) {
    const { toast } = useToast();
    const uses = partnerData.promoCodeUses || 0;
    const progress = Math.min((uses / REWARD_GOAL) * 100, 100);
    const [motivation, setMotivation] = useState({ text: "", color: ""});
    
    useEffect(() => {
        setMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    }, [partnerData.promoCodeUses]);

    const handleCopy = (textToCopy: string, type: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({ variant: 'success', title: `${type} copié !` });
    };

    return (
        <PageWrapper showBackButton={false}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
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
                 <div className="mt-8 text-center">
                    <Button variant="outline" asChild>
                         <Link href="/partner/login">
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Se déconnecter
                        </Link>
                    </Button>
                </div>
            </div>
        </PageWrapper>
    );
}

function StatusCheckPage() {
    const { firestore } = useFirebase();
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const storedId = sessionStorage.getItem('partner_uid');
        if (storedId) {
            setPartnerId(storedId);
        } else {
            router.push('/partner/login');
        }
    }, [router]);
    
    const partnerDocRef = useMemoFirebase(() => {
        if (!firestore || !partnerId) return null;
        return doc(firestore, 'submissions', partnerId);
    }, [firestore, partnerId]);
    
    const { data: partnerData, isLoading, error } = useDoc<ContractSubmission>(partnerDocRef);

    useEffect(() => {
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de récupérer les informations du partenaire.' });
            router.push('/partner/login');
        }
    }, [error, router, toast]);

    const handleCopyPassword = () => {
        if (partnerData?.password) {
            navigator.clipboard.writeText(partnerData.password);
            toast({ variant: 'success', title: 'Mot de passe copié !' });
        }
    }
    
    if (isLoading || !partnerId) {
        return <LoadingSpinner />;
    }

    if (partnerData) {
         if (partnerData.status === 'confirmé') {
            return <PartnerDashboard partnerData={partnerData} />;
        } else {
            return (
                <PageWrapper>
                    <NeumorphicCard className="max-w-2xl mx-auto p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <NeumorphicCard className="rounded-full p-4">
                                <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                            </NeumorphicCard>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold font-headline">Demande en cours d'examen</h1>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                            Merci pour votre demande ! Nous l'examinons et reviendrons vers vous rapidement. Cette page se mettra à jour automatiquement une fois votre demande approuvée.
                        </p>
                    </NeumorphicCard>
                </PageWrapper>
            );
        }
    }

    // Fallback if data is null after loading
    return <PageWrapper><p>Partenaire non trouvé. Redirection...</p></PageWrapper>;
}


export default function PartnerDashboardPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <StatusCheckPage />
        </Suspense>
    )
}
