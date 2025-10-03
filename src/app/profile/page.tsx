
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
  const skills = ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Firebase', 'UI/UX Design', 'Neumorphism'];

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
          {profileImage && (
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
               <NeumorphicCard className="w-full h-full rounded-full p-2">
                <Image
                  src={profileImage.imageUrl}
                  alt={profileImage.description}
                  width={160}
                  height={160}
                  className="rounded-full object-cover"
                  data-ai-hint={profileImage.imageHint}
                />
              </NeumorphicCard>
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold font-headline">{ user?.displayName || 'Jean Dupont' }</h1>
            <p className="text-xl text-primary font-medium mt-1">Développeur Full-Stack & Designer UI</p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{ user?.email || 'jean.dupont@email.com' }</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+33 6 12 34 56 78</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div>
          <h2 className="text-2xl font-bold font-headline mb-4">À propos de moi</h2>
          <p className="text-muted-foreground leading-relaxed">
            Passionné par la création d'expériences numériques intuitives et esthétiques, je me spécialise dans le développement d'applications web modernes avec React et Next.js. Mon approche est centrée sur l'utilisateur, en combinant des compétences techniques solides avec un œil pour le design. J'aime expérimenter avec de nouveaux styles visuels comme le neumorphisme pour repousser les limites de l'interface utilisateur.
          </p>
        </div>

        <Separator className="my-8" />

        <div>
          <h2 className="text-2xl font-bold font-headline mb-4">Compétences</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-sm py-1 px-3 neumorphic-card-light dark:neumorphic-card-dark">
                    {skill}
                </Badge>
            ))}
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
}
