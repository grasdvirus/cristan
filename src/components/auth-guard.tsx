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
    // If loading, do nothing yet. The loading screen will be displayed.
    if (isUserLoading) {
      return;
    }

    const isLoginPage = pathname === '/login';

    // If there is a user and they are on the login page, redirect to home.
    if (user && isLoginPage) {
      router.replace('/');
    }

    // If there's no user and we're not on the login page, redirect to login.
    if (!user && !isLoginPage) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // While loading auth state, we show a loader.
  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  // If there's a user, or we are on the public login page (and not loading), render the children.
  if (user || pathname === '/login') {
    return <>{children}</>;
  }

  // If no user and not on login page, this will be briefly rendered before redirect.
  // This state indicates that the useEffect has run and is now redirecting.
  return <LoadingSpinner />;
}
