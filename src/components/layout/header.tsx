import Link from 'next/link';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Home, User } from 'lucide-react';

export default function Header() {

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className={cn('container flex h-16 items-center')}>
        <div className="flex flex-1 items-center justify-start">
          <ThemeToggleButton />
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
