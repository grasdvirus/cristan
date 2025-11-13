
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useUser } from '@/firebase';
import { LoadingSpinner } from './loading-spinner';

const ADMIN_EMAILS = ['grasdvirus@gmail.com'];

interface AuthGuardProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }

    if (!user) {
      // If the page is protected and requires a user, redirect to login
      if (adminOnly || pathname === '/profile' || pathname === '/partner') {
        router.replace(`/login?redirect=${pathname}`);
      }
      return;
    }
    
    // If the page is admin-only and the user is not an admin, redirect
    if (adminOnly && (!user.email || !ADMIN_EMAILS.includes(user.email))) {
        router.replace('/profile'); // Redirect non-admins away from admin pages
    }

  }, [user, isUserLoading, router, pathname, adminOnly]);

  // While checking user auth state, show a spinner.
  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  // If page requires auth and there is no user, show spinner during redirect.
  if ((adminOnly || pathname === '/profile' || pathname === '/partner') && !user) {
    return <LoadingSpinner />;
  }

  // If admin-only page and user is not an admin, show spinner during redirect.
  if (adminOnly && (!user || !user.email || !ADMIN_EMAILS.includes(user.email))) {
    return <LoadingSpinner />;
  }

  // If all checks pass, render the protected children.
  return <>{children}</>;
}
