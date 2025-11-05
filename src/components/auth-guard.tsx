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
    if (isUserLoading) {
      return; // Ne rien faire tant que l'état de l'utilisateur n'est pas connu.
    }

    const isLoginPage = pathname === '/login';

    if (user && isLoginPage) {
      router.replace('/');
    }

    if (!user && !isLoginPage) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // Si l'application détermine l'état de l'utilisateur, ou si une redirection est sur le point de se produire,
  // afficher un spinner est la chose la plus sûre à faire pour éviter les flashs de contenu.
  if (isUserLoading || (!user && pathname !== '/login') || (user && pathname === '/login')) {
    return <LoadingSpinner />;
  }

  // Si l'état de l'utilisateur est connu et qu'aucune redirection n'est nécessaire, afficher le contenu.
  return <>{children}</>;
}
