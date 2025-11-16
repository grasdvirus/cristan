
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useFirebase } from '@/firebase';
import { getDocs, query, collection, where } from 'firebase/firestore';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function PartnerLoginPage() {
    const { firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !password) return;
        
        setIsSubmitting(true);
        setError(null);

        try {
            const q = query(collection(firestore, "submissions"), where("password", "==", password), where("type", "==", "Partenariat"));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Assuming passwords are unique per partner
                const partnerDoc = querySnapshot.docs[0];
                const partnerData = partnerDoc.data();

                if (partnerData.status === 'confirmé') {
                    // Store UID in session storage to "log in" the partner
                    sessionStorage.setItem('partner_uid', partnerDoc.id);
                    toast({ variant: 'success', title: 'Connexion réussie !' });
                    router.push('/partner/dashboard');
                } else {
                    setError('Votre compte partenaire n\'est pas encore actif.');
                    toast({ variant: 'warning', title: 'Compte en attente', description: 'Votre demande est en cours de validation.' });
                }
            } else {
                setError('Mot de passe incorrect.');
                toast({ variant: 'destructive', title: 'Erreur', description: 'Le mot de passe est invalide.' });
            }
        } catch (err) {
            console.error(err);
            setError('Une erreur est survenue.');
            toast({ variant: 'destructive', title: 'Erreur de connexion', description: 'Impossible de vérifier vos informations.' });
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
                <Link href="/partner">
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
                </NeumorphicCard>
            </div>
        </div>
    )
}
