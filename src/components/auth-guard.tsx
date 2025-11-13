
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
      router.replace(`/login?redirect=${pathname}`);
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

  // If the logic determined a redirect is needed, show a spinner
  // while the browser navigates to the new page.
  if (!user || (adminOnly && (!user.email || !ADMIN_EMAILS.includes(user.email)))) {
    return <LoadingSpinner />;
  }

  // If all checks pass, render the protected children.
  return <>{children}</>;
}

    