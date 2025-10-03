
'use client';

import Image from 'next/image';
import { Mail, LogOut, KeyRound, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';

import { useFirebase } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { auth, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  const handlePasswordReset = async () => {
    if (!auth || !user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
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
  };

  const profileImage = PlaceHolderImages.find(
    (img) => img.id === 'profile-avatar'
  );
  
  const getInitials = (name?: string | null) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24 space-y-8">
      <NeumorphicCard className="max-w-4xl mx-auto relative">
        {user && (
            <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className={cn(
                'rounded-full transition-all duration-300 absolute top-4 right-4',
                'dark:btn-neumorphic-dark btn-neumorphic-light'
            )}
            aria-label="Déconnexion"
            >
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        )}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
             <NeumorphicCard className="w-full h-full rounded-full p-2">
                <Avatar className='w-full h-full text-4xl'>
                    <AvatarImage src={user?.photoURL || profileImage?.imageUrl || ''} alt={user?.displayName || 'Avatar'} />
                    <AvatarFallback className='bg-muted'>
                        {getInitials(user?.displayName)}
                    </AvatarFallback>
                </Avatar>
            </NeumorphicCard>
          </div>
          <div className="text-center sm:text-left w-full">
            <h1 className="text-4xl font-bold font-headline">{ user?.displayName || 'Jean Dupont' }</h1>
            <div className="mt-4 flex flex-col items-center sm:items-start gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{ user?.email || 'jean.dupont@email.com' }</span>
              </div>
               {user?.providerData.some(p => p.providerId === 'password') && (
                <Button onClick={handlePasswordReset} variant="outline" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Réinitialiser le mot de passe
                </Button>
              )}
            </div>
          </div>
        </div>
      </NeumorphicCard>

      <NeumorphicCard className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold font-headline">Informations</h2>
                <p className="text-muted-foreground text-sm mt-1">En savoir plus sur notre projet.</p>
            </div>
            <Button variant="outline" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                <Info className="mr-2 h-4 w-4" />
                À propos de cristan
            </Button>
        </div>
      </NeumorphicCard>
    </div>
  );
}
