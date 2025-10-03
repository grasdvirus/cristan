
'use client';

import Image from 'next/image';
import { Mail, MapPin, Phone, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useFirebase } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { auth, user } = useFirebase();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
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
    <div className="container mx-auto px-4 py-16 sm:py-24">
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
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold font-headline">{ user?.displayName || 'Jean Dupont' }</h1>
            <p className="text-xl text-primary font-medium mt-1">Développeur Full-Stack & Designer UI</p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{ user?.email || 'jean.dupont@email.com' }</span>
              </div>
            </div>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
}
