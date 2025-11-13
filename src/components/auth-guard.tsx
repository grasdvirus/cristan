
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

  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  // Si on attend un utilisateur mais qu'il n'y en a pas, on affiche le spinner
  // en attendant la redirection de l'useEffect.
  if (!user) {
    return <LoadingSpinner />;
  }
  
  if (adminOnly && (!user.email || !ADMIN_EMAILS.includes(user.email))) {
    // Affiche le spinner pendant la redirection pour éviter un flash de contenu non autorisé.
    return <LoadingSpinner />;
  }


  return <>{children}</>;
}
