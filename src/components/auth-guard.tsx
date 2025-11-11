'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useUser } from '@/firebase';
import { LoadingSpinner } from './loading-spinner';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the user's auth state is confirmed.
    if (isUserLoading) {
      return; 
    }

    // If the user is not logged in, redirect them to the login page.
    if (!user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // While loading or if there's no user and we are about to redirect,
  // show a loading spinner to prevent flashing of protected content.
  if (isUserLoading || !user) {
    return <LoadingSpinner />;
  }

  // If the user is authenticated, render the children.
  return <>{children}</>;
}

    