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

export default function LoginPage() {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // This effect handles the user being redirected away from login if already authenticated
  useEffect(() => {
    if (!isUserLoading && user) {
        router.replace('/profile');
    }
  }, [user, isUserLoading, router]);

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
      // The useEffect hook will now handle redirection
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

  if (isUserLoading || (isSubmitting && !form.formState.isDirty)) {
      return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <NeumorphicCard className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-headline">{isSignUp ? 'Créer un compte' : 'Bienvenue'}</h1>
            <p className="text-muted-foreground mt-2">{isSignUp ? 'Remplissez les champs pour vous inscrire.' : 'Connectez-vous pour continuer'}</p>
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
