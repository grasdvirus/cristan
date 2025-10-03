
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
} from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Chrome } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { auth } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleEmailPasswordAction = async (values: LoginFormValues, action: 'signIn' | 'signUp') => {
    if (!auth) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (action === 'signIn') {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      } else {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'authentification',
        description: err.message,
      });
    } finally {
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
      router.push('/');
    } catch (err: any) {
      setError(err.message);
       toast({
        variant: 'destructive',
        title: 'Erreur Google Sign-In',
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <NeumorphicCard className="w-full max-w-md">
        <h1 className="text-3xl font-bold font-headline text-center mb-2">Bienvenue</h1>
        <p className="text-muted-foreground text-center mb-6">Connectez-vous pour continuer</p>
        
        <form className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="votre@email.com"
              className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark mt-1"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input 
              id="password" 
              type="password"
              placeholder="********"
              className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark mt-1"
              {...register('password')}
            />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              type="button"
              onClick={handleSubmit(vals => handleEmailPasswordAction(vals, 'signIn'))} 
              disabled={isSubmitting}
              className="w-full btn-neumorphic-light dark:btn-neumorphic-dark"
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(vals => handleEmailPasswordAction(vals, 'signUp'))} 
              disabled={isSubmitting}
              variant="secondary"
              className="w-full btn-neumorphic-light dark:btn-neumorphic-dark"
            >
              {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </div>
        </form>

        <div className="my-6 flex items-center">
            <Separator className="flex-grow" />
            <span className="mx-4 text-xs text-muted-foreground">OU</span>
            <Separator className="flex-grow" />
        </div>

        <Button 
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            variant="outline" 
            className="w-full btn-neumorphic-light dark:btn-neumorphic-dark"
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continuer avec Google
        </Button>
      </NeumorphicCard>
    </div>
  );
}
