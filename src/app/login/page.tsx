
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Chrome, Fingerprint, AtSign, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signUp, signIn, signInWithGoogle } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleAuthAction = async () => {
        setIsLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
                toast({ title: "Connexion réussie", description: "Bienvenue à nouveau !" });
            } else {
                if (password !== confirmPassword) {
                    toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas." });
                    setIsLoading(false);
                    return;
                }
                await signUp(email, password);
                toast({ title: "Inscription réussie", description: "Votre compte a été créé." });
            }
            router.push('/');
        } catch (error: any) {
            const errorMessage = error.code ? 
              (error.code.includes('auth/invalid-credential') ? 'Identifiants invalides.' :
               error.code.includes('auth/email-already-in-use') ? 'Cet email est déjà utilisé.' :
               error.code.includes('auth/weak-password') ? 'Le mot de passe doit contenir au moins 6 caractères.' :
               "Une erreur s'est produite.") :
              "Une erreur inconnue s'est produite.";
            toast({ variant: "destructive", title: "Erreur d'authentification", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            toast({ title: "Connexion Google réussie" });
            router.push('/');
        } catch (error: any) {
             toast({ variant: "destructive", title: "Erreur Google", description: "Impossible de se connecter avec Google. Veuillez réessayer." });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-background">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4">
                       <Fingerprint className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="font-headline text-3xl">
                        {isLogin ? 'Bienvenue !' : 'Rejoignez-nous'}
                    </CardTitle>
                    <CardDescription>
                        {isLogin ? 'Connectez-vous pour continuer.' : 'Créez un compte pour commencer.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                         <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input id="email" type="email" placeholder="votre.email@exemple.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                        </div>
                        <div className="relative">
                             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input id="password" type="password" placeholder="Mot de passe" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                        </div>
                         {!isLogin && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="confirm-password" type="password" placeholder="Confirmez le mot de passe" className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading}/>
                            </div>
                        )}
                    </div>
                    
                    <Button className="w-full font-bold py-6" onClick={handleAuthAction} disabled={isLoading}>
                       {isLoading && <Loader2 className="animate-spin mr-2" />}
                       {isLogin ? 'Se Connecter' : 'Créer le compte'}
                    </Button>
                    
                    <div className="relative">
                        <Separator />
                        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">
                            OU
                        </span>
                    </div>

                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                        {isLoading && <Loader2 className="animate-spin mr-2" />}
                        <Chrome className="mr-2 h-5 w-5" />
                        Continuer avec Google
                    </Button>
                    
                    <p className="text-center text-sm text-muted-foreground">
                        {isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}
                        <Button variant="link" className="font-semibold" onClick={() => setIsLogin(!isLogin)} disabled={isLoading}>
                            {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
                        </Button>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
