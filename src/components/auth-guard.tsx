'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useUser } from '@/firebase';
import { LoadingSpinner } from './loading-spinner';

const ADMIN_EMAILS = ['grasdvirus@gmail.com', 'christianvirus77@gmail.com'];

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
    
    // If the page is admin-only and the user is not in the admin list, redirect.
    if (adminOnly && (!user.email || !ADMIN_EMAILS.includes(user.email))) {
        router.replace('/profile'); // Redirect non-admins away from admin pages
    }

  }, [user, isUserLoading, router, pathname, adminOnly]);

  // While checking user auth state, show a spinner.
  if (isUserLoading) {
    return <LoadingSpinner />;
  }
  
  // If user is not logged in yet, show spinner while redirecting.
  if (!user) {
    return <LoadingSpinner />;
  }

  // If this is an admin page and the logged-in user is not an admin, show a spinner during redirect.
  if (adminOnly && (!user.email || !ADMIN_EMAILS.includes(user.email))) {
    return <LoadingSpinner />;
  }

  // If all checks pass, render the protected children.
  return <>{children}</>;
}
