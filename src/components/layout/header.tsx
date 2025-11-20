'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Home, User, Bell } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { CustomThemeSwitch } from '../custom-theme-switch';

export default function Header() {
  const { user } = useFirebase();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className={cn('container flex h-16 items-center')}>
        <div className="flex flex-1 items-center justify-start gap-4">
          <CustomThemeSwitch />
           <Link href="/news" passHref>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-full relative',
                'dark:btn-neumorphic-dark btn-neumorphic-light'
              )}
              aria-label="Actualités"
            >
              <Bell className="h-[1.2rem] w-[1.2rem]" />
              {/* Red dot for new content notification */}
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </Button>
          </Link>
        </div>
        <div className="flex-1 text-center">
          <Link href="/" className="flex items-center justify-center gap-2">
            <span className="text-xl font-bold font-headline text-foreground">
              cristan
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-end gap-4 md:gap-6">
          <Link href="/" passHref>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-full transition-all duration-300',
                'dark:btn-neumorphic-dark btn-neumorphic-light'
              )}
              aria-label="Accueil"
            >
              <Home className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </Link>
          <Link href="/profile" passHref>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-full transition-all duration-300',
                'dark:btn-neumorphic-dark btn-neumorphic-light'
              )}
              aria-label="Profil"
            >
              <User className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
