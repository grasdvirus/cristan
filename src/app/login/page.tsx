
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from 'firebase/auth';
import { useFirebase, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Separator } from '@/components/ui/separator';

const signUpSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.582-3.333-11.127-7.962l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.62,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
}

export default function LoginPage() {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!auth) {
      setIsProcessingRedirect(false);
      return;
    }
    
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          toast({ variant: 'success', title: 'Connexion via Google réussie !' });
        }
      })
      .catch((error) => {
        console.error("Erreur de redirection Google:", error);
        if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
          toast({
            variant: 'destructive',
            title: 'Erreur de connexion Google',
            description: "La connexion n'a pas pu être finalisée. Veuillez vérifier la configuration de votre projet Firebase et que votre domaine est autorisé.",
          });
        }
      })
      .finally(() => {
        setIsProcessingRedirect(false);
      });
  }, [auth, toast]);

  useEffect(() => {
    if (!isUserLoading && !isProcessingRedirect && user) {
        router.replace('/profile');
    }
  }, [user, isUserLoading, isProcessingRedirect, router]);

  const form = useForm<SignUpFormValues | LoginFormValues>({
    resolver: zodResolver(isSignUp ? signUpSchema : loginSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(isSignUp && { name: '', confirmPassword: '' }),
    },
  });

  const handleEmailPasswordAction = async (values: SignUpFormValues | LoginFormValues) => {
    if (!auth) return;
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isSignUp) {
        const signUpValues = values as SignUpFormValues;
        const userCredential = await createUserWithEmailAndPassword(auth, signUpValues.email, signUpValues.password);
        await updateProfile(userCredential.user, {
            displayName: signUpValues.name
        });
        toast({ variant: "success", title: "Compte créé !", description: "Vous êtes maintenant connecté."});
      } else {
        const loginValues = values as LoginFormValues;
        await signInWithEmailAndPassword(auth, loginValues.email, loginValues.password);
        toast({ variant: "success", title: "Connexion réussie !"});
      }
    } catch (err: any) {
      let friendlyMessage = 'Une erreur est survenue.';
      switch(err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          friendlyMessage = 'Email ou mot de passe incorrect.';
          break;
        case 'auth/email-already-in-use':
            friendlyMessage = 'Cette adresse e-mail est déjà utilisée.';
            break;
        case 'auth/weak-password':
            friendlyMessage = 'Le mot de passe est trop faible.';
            break;
        default:
            friendlyMessage = 'Une erreur d\'authentification est survenue. Veuillez réessayer.';
      }
      setError(friendlyMessage);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'authentification',
        description: friendlyMessage,
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
        await signInWithRedirect(auth, provider);
    } catch (error) {
        console.error("Erreur au lancement de la redirection Google:", error);
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Impossible de démarrer la connexion avec Google.",
        });
    }
  };
  
  const handlePasswordReset = async () => {
    if (!auth) return;
    const email = form.getValues('email');
    if (!email) {
      form.setError('email', { type: 'manual', message: 'Veuillez entrer votre email pour réinitialiser le mot de passe.' });
      return;
    }
    
    const emailSchema = z.string().email('Adresse e-mail invalide');
    const validation = emailSchema.safeParse(email);
    if(!validation.success) {
      form.setError('email', { type: 'manual', message: validation.error.errors[0].message });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        variant: 'success',
        title: 'E-mail envoyé',
        description: 'Un lien pour réinitialiser votre mot de passe a été envoyé à votre adresse e-mail.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'envoyer l'email de réinitialisation.",
      });
    }
  }

  const toggleFormMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    form.reset();
  }
  
  const { register, handleSubmit, formState: { errors } } = form;

  if (isUserLoading || isProcessingRedirect) {
      return <LoadingSpinner />;
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <NeumorphicCard className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-headline">{isSignUp ? 'Créer un compte' : 'Bienvenue'}</h1>
            <p className="text-muted-foreground mt-2">{isSignUp ? 'Remplissez les champs pour vous inscrire.' : 'Connectez-vous pour continuer'}</p>
        </div>

        <Button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            variant="outline"
            className="w-full btn-neumorphic-light dark:btn-neumorphic-dark"
            size="lg"
        >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
            {isSubmitting ? 'Redirection...' : 'Continuer avec Google'}
        </Button>

        <div className="flex items-center my-6">
            <Separator className="flex-1" />
            <span className="px-4 text-xs text-muted-foreground">OU</span>
            <Separator className="flex-1" />
        </div>
        
        <form onSubmit={handleSubmit(handleEmailPasswordAction)} className="space-y-4">
          {isSignUp && (
             <div>
                <Label htmlFor="name">Nom</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Jean Dupont"
                  className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark mt-1"
                  {...register('name')}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{(errors.name as any).message}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="votre@email.com"
              className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark mt-1"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{(errors.email as any).message}</p>}
          </div>
          <div className="relative">
            <Label htmlFor="password">Mot de passe</Label>
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark mt-1 pr-10"
              {...register('password')}
            />
             <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-[9px] h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {errors.password && <p className="text-sm text-destructive mt-1">{(errors.password as any).message}</p>}
          </div>
           {isSignUp && (
            <div className="relative">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input 
                id="confirmPassword" 
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark mt-1 pr-10"
                {...register('confirmPassword')}
                />
                 <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-[9px] h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{(errors.confirmPassword as any).message}</p>}
            </div>
          )}
          {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}
          
          {!isSignUp && (
            <div className="text-right">
              <Button type="button" variant="link" size="sm" onClick={handlePasswordReset} className="p-0 h-auto text-xs text-muted-foreground hover:text-primary">
                Mot de passe oublié ?
              </Button>
            </div>
          )}

          <div className="pt-4">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-neumorphic-light dark:btn-neumorphic-dark"
              size="lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (isSignUp ? 'S\'inscrire' : 'Se connecter')}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button onClick={toggleFormMode} className="font-semibold text-primary hover:underline focus:outline-none">
                {isSignUp ? 'Se connecter' : 'S\'inscrire'}
            </button>
        </p>
      </NeumorphicCard>
    </div>
  );
}

    

    