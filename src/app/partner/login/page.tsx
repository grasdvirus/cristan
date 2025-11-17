'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

async function verifyPartnerPassword(password: string): Promise<{ success: boolean; data?: any; error?: string; status?: string }> {
    'use server';
    // This code runs only on the server
    try {
        const { initializeApp, getApps, App } = await import('firebase-admin/app');
        const { getFirestore } = await import('firebase-admin/firestore');
        const { credential } = await import('firebase-admin');

        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountKey) {
            throw new Error('Firebase service account key is not configured on the server.');
        }

        let adminApp: App;
        if (!getApps().length) {
            adminApp = initializeApp({
                credential: credential.cert(JSON.parse(serviceAccountKey)),
            });
        } else {
            adminApp = getApps()[0];
        }

        const db = getFirestore(adminApp);

        const partnersRef = db.collection('submissions');
        const snapshot = await partnersRef.where('password', '==', password).where('type', '==', 'Partenariat').limit(1).get();

        if (snapshot.empty) {
            return { success: false, error: 'Mot de passe invalide.' };
        }

        const partnerDoc = snapshot.docs[0];
        const partnerData = partnerDoc.data();

        if (partnerData.status !== 'confirmé') {
            return { success: false, error: 'Compte non actif.', status: 'en attente' };
        }
        
        // Return only the necessary data for the dashboard
        const dashboardData = {
            id: partnerDoc.id,
            fullName: partnerData.fullName,
            promoCode: partnerData.promoCode,
            promoCodeUses: partnerData.promoCodeUses || 0,
            promoCodeTotalUses: partnerData.promoCodeTotalUses || 0,
        };

        return { success: true, data: dashboardData };

    } catch (error) {
        console.error('Server Action Error in verifyPartnerPassword:', error);
        return { success: false, error: 'Erreur interne du serveur.' };
    }
}


export default function PartnerLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
     
    useEffect(() => {
        // Clear session storage on page load to ensure fresh login
        sessionStorage.removeItem('partner_data');
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await verifyPartnerPassword(password);
            
            if (result.success && result.data) {
                // Store data in session storage and redirect
                sessionStorage.setItem('partner_data', JSON.stringify(result.data));
                toast({ variant: 'success', title: 'Connexion réussie !' });
                router.push('/partner/dashboard');
            } else {
                const errorMessage = result.status === 'en attente'
                    ? 'Votre compte partenaire n\'est pas encore actif.'
                    : (result.error || 'Mot de passe incorrect.');
                setError(errorMessage);
                toast({ variant: result.status === 'en attente' ? 'warning' : 'destructive', title: 'Erreur', description: errorMessage });
            }
        } catch (err) {
            console.error(err);
            const friendlyError = 'Une erreur de communication est survenue. Veuillez réessayer.';
            setError(friendlyError);
            toast({ variant: 'destructive', title: 'Erreur de connexion', description: friendlyError });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
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
            <div className="max-w-sm mx-auto">
                <NeumorphicCard>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold font-headline">Connexion Partenaire</h1>
                        <p className="text-muted-foreground mt-2">Accédez à votre tableau de bord.</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <Label htmlFor="password">Mot de passe partenaire</Label>
                            <div className="relative mt-1">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Entrez votre mot de passe"
                                    className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark pr-10"
                                />
                                 <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-[9px] h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                        </div>
                        <Button type="submit" size="lg" className="w-full btn-neumorphic-light dark:btn-neumorphic-dark" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </form>
                     <p className="text-center text-sm text-muted-foreground mt-6">
                        Pas encore partenaire ?{' '}
                        <Link href="/partner/register" className="font-semibold text-primary hover:underline focus:outline-none">
                            Devenir partenaire
                        </Link>
                    </p>
                </NeumorphicCard>
            </div>
        </div>
    )
}