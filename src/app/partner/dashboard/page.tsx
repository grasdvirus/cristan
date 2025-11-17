
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useFirebase } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { BarChart2, User, Trophy, Copy, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
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


function PartnerDashboardContent({ partnerData, onSignOut }: { partnerData: ContractSubmission, onSignOut: () => void }) {
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
                    <Button variant="outline" onClick={onSignOut}>
                         <ArrowLeft className="mr-2 h-4 w-4"/>
                         Se déconnecter
                    </Button>
                </div>
            </div>
        </PageWrapper>
    );
}

function StatusCheckPage() {
    const { firestore } = useFirebase();
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [partnerData, setPartnerData] = useState<ContractSubmission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        if (!firestore || !partnerId) return;
    
        setIsLoading(true);
        const partnerRef = doc(firestore, 'submissions', partnerId);
    
        const unsubscribe = onSnapshot(partnerRef, 
            (snapshot) => {
              if (snapshot.exists()) {
                setPartnerData(snapshot.data() as ContractSubmission);
              } else {
                setPartnerData(null);
                toast({ variant: 'destructive', title: 'Erreur', description: 'Partenaire non trouvé.' });
                router.push('/partner/login');
              }
              setIsLoading(false);
            }, 
            (error) => {
              const permissionError = new FirestorePermissionError({
                path: partnerRef.path,
                operation: 'get',
              });
              errorEmitter.emit('permission-error', permissionError);
              
              setIsLoading(false);
              toast({ 
                variant: 'destructive', 
                title: 'Erreur de connexion', 
                description: 'Impossible de récupérer vos informations.' 
              });
            }
        );
    
        return () => unsubscribe();
      }, [firestore, partnerId, router, toast]);

    const handleSignOut = () => {
        sessionStorage.removeItem('partner_uid');
        router.push('/partner/login');
    }
    
    if (isLoading || !partnerData) {
        return <LoadingSpinner />;
    }

    if (partnerData.status !== 'confirmé') {
         router.push('/partner/register'); // Redirect to registration page which handles pending status
         return <LoadingSpinner />;
    }

    return <PartnerDashboardContent partnerData={partnerData} onSignOut={handleSignOut} />;
}


export default function PartnerDashboardPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <StatusCheckPage />
        </Suspense>
    )
}
