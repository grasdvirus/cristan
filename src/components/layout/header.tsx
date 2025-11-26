'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Home, User, Bell } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { CustomThemeSwitch } from '../custom-theme-switch';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';

type NewsItem = {
    id: string;
    createdAt: Timestamp;
};

export default function Header() {
  const { user } = useFirebase();
  const { firestore } = useFirebase();
  const [hasNewNews, setHasNewNews] = useState(false);

  // Query for the latest news item
  const latestNewsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'news'), orderBy('createdAt', 'desc'), limit(1)) : null,
    [firestore]
  );
  const { data: latestNewsItems } = useCollection<NewsItem>(latestNewsQuery);

  useEffect(() => {
    if (latestNewsItems && latestNewsItems.length > 0) {
      const latestNewsTimestamp = latestNewsItems[0].createdAt.seconds;
      const lastSeenNewsTimestamp = localStorage.getItem('lastSeenNewsTimestamp');
      
      if (!lastSeenNewsTimestamp || latestNewsTimestamp > Number(lastSeenNewsTimestamp)) {
        setHasNewNews(true);
      } else {
        setHasNewNews(false);
      }
    } else {
      setHasNewNews(false);
    }
  }, [latestNewsItems]);


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
                <span className={cn(
                  "absolute inline-flex h-full w-full rounded-full bg-red-400",
                  hasNewNews ? "animate-ping opacity-75" : "opacity-0"
                )}></span>
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2 bg-red-500",
                   !hasNewNews && "opacity-30"
                )}></span>
              </span>
            </Button>
          </Link>
        </div>
        <div className="flex-1 text-center">
          <Link href="/" className="flex items-center justify-center gap-2">
            <span className="text-xl font-bold font-headline text-foreground animate-rainbow-text">
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
