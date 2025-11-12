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
      router.replace('/login');
      return;
    }
    
    if (adminOnly && (!user.email || !ADMIN_EMAILS.includes(user.email))) {
        // If it's an admin-only page and the user is not an admin,
        // redirect them to their profile, not the login page.
        router.replace('/profile');
    }

  }, [user, isUserLoading, router, pathname, adminOnly]);

  if (isUserLoading || !user || (adminOnly && (!user.email || !ADMIN_EMAILS.includes(user.email)))) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
