
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
      if(adminOnly){
        router.replace(`/login?redirect=${pathname}`);
        return;
      }
      // For non-admin pages, if user is not required, we can just return and render children
      // but if we are protecting a page like /profile, a redirect is needed.
      if (pathname === '/profile') {
        router.replace(`/login?redirect=${pathname}`);
      }
      return;
    }
    
    if (adminOnly && (!user.email || !ADMIN_EMAILS.includes(user.email))) {
        router.replace('/profile');
    }

  }, [user, isUserLoading, router, pathname, adminOnly]);

  // While checking user auth state, show a spinner.
  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  // If we are protecting an admin page and the user is not an admin, show a spinner during redirect.
  if (adminOnly && (!user || !user.email || !ADMIN_EMAILS.includes(user.email))) {
    return <LoadingSpinner />;
  }

  // If we are protecting a general user page (like /profile) and there is no user, show spinner during redirect.
  if (pathname === '/profile' && !user) {
    return <LoadingSpinner />;
  }

  // If all checks pass, render the protected children.
  return <>{children}</>;
}
