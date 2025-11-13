
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useUser } from '@/firebase';
import { LoadingSpinner } from './loading-spinner';

const ADMIN_EMAILS = ['grasdvirus@gmail.com', 'christianvirus77@gmail.com', 'devcristan3@gmail.com'];

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

  if (isUserLoading || !user) {
    return <LoadingSpinner />;
  }
  
  if (adminOnly && (!user.email || !ADMIN_EMAILS.includes(user.email))) {
    // This check is redundant due to the useEffect, but it's a good safeguard
    // to prevent flashing the content.
    return <LoadingSpinner />;
  }


  return <>{children}</>;
}
