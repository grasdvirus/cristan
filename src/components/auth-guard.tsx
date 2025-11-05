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
    // Ne rien faire tant que l'état de l'utilisateur n'est pas certain.
    if (isUserLoading) {
      return; 
    }

    const isLoginPage = pathname === '/login';

    // Si l'utilisateur est connecté et essaie d'accéder à la page de connexion,
    // le rediriger vers la page d'accueil.
    if (user && isLoginPage) {
      router.replace('/');
    }

    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page autre
    // que la page de connexion, le rediriger vers la page de connexion.
    if (!user && !isLoginPage) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // Affiche un écran de chargement si :
  // 1. L'authentification est en cours de vérification.
  // 2. Ou si une redirection est imminente (pour éviter un flash de contenu).
  if (isUserLoading || (!user && pathname !== '/login') || (user && pathname === '/login')) {
    return <LoadingSpinner />;
  }

  // Si tout est en ordre (ex: utilisateur connecté sur une page protégée), affiche le contenu.
  return <>{children}</>;
}
