'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Eye, EyeOff, Loader2 } from 'lucide-react';

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
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
        // The AuthGuard will handle the redirection.
      } else {
        const loginValues = values as LoginFormValues;
        await signInWithEmailAndPassword(auth, loginValues.email, loginValues.password);
        // The AuthGuard will handle the redirection.
      }
      // No router.push here, AuthGuard handles it.
    } catch (err: any) {
      let friendlyMessage = 'Une erreur est survenue.';
      switch(err.code) {
        case 'auth/invalid-credential':
          friendlyMessage = 'Email ou mot de passe incorrect.';
          break;
        case 'auth/email-already-in-use':
            friendlyMessage = 'Cette adresse e-mail est déjà utilisée.';
            break;
        case 'auth/weak-password':
            friendlyMessage = 'Le mot de passe est trop faible.';
            break;
        default:
            friendlyMessage = err.message;
      }
      setError(friendlyMessage);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'authentification',
        description: friendlyMessage,
      });
      setIsSubmitting(false);
    } 
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsSubmitting(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // SUCCESS!
      // We do NOT redirect here. We let the page stay in a "submitting" state.
      // The `AuthGuard` component will detect the user state change and perform the redirection.
      // This is a more robust pattern than a manual redirect.
    } catch (err: any) {
      // If the user closes the popup, it's not a real error.
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
        toast({
          variant: 'destructive',
          title: 'Erreur Google Sign-In',
          description: err.message,
        });
      }
      // In all error cases (including popup closed), we stop the submitting state.
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
        description: error.message,
      });
    }
  }

  const toggleFormMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    form.reset();
  }
  
  const { register, handleSubmit, formState: { errors } } = form;

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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
              <span className="bg-background px-2 text-xs uppercase text-muted-foreground">Ou</span>
          </div>
        </div>

        <Button 
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            variant="outline" 
            className="w-full btn-neumorphic-light dark:btn-neumorphic-dark"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
          Continuer avec Google
        </Button>
      </NeumorphicCard>
    </div>
  );
}
