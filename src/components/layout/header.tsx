import Link from 'next/link';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { cn } from '@/lib/utils';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className={cn("container flex h-20 items-center justify-between")}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold font-headline text-foreground">
            Mon Portfolio Personnel
          </span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Accueil
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Profil
          </Link>
          <ThemeToggleButton />
        </nav>
      </div>
    </header>
  );
}
