
'use client'

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileNav from '@/components/layout/mobile-nav';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { Loader2 } from 'lucide-react';


function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const isLoginPage = pathname === '/login';
  const isAdminPage = pathname.startsWith('/admin');
  const isVideoPage = pathname.startsWith('/video');
  
  const protectedRoutes = [
      '/admin',
      '/profile',
      '/subscribe',
      '/paiement',
      '/contact',
  ];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    // Ne rien faire pendant que l'authentification est en cours de vérification.
    if (loading) {
      return; 
    }

    // Une fois le chargement terminé, appliquer les règles de redirection.
    if (user && isLoginPage) {
      // Si l'utilisateur est connecté et va sur la page de login, le rediriger.
      router.push('/');
    } else if (!user && isProtectedRoute) {
      // Si l'utilisateur n'est pas connecté et tente d'accéder à une page protégée, le rediriger.
      router.push('/login');
    }
    
  }, [user, loading, isLoginPage, isProtectedRoute, router, pathname]);

  // Si le chargement est en cours, afficher un loader pour éviter tout rendu prématuré.
  if (loading) {
     return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground mt-4">Chargement de la session...</p>
        </div>
     );
  }
  
  // Si on est sur une route protégée sans utilisateur (le temps que la redirection s'effectue)
  if (!user && isProtectedRoute) {
     return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground mt-4">Redirection vers la connexion...</p>
        </div>
     );
  }

  // Permettre l'affichage de la page de login sans le layout principal
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  // La page admin a son propre layout interne
  if (isAdminPage) {
    return (
        <main className="flex-1">
            {children}
        </main>
    );
  }

  return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className={cn(
          "flex-grow w-full py-8",
          isVideoPage ? "px-0" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        )}>
          {children}
        </main>
        <Footer />
        <MobileNav />
      </div>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="fr" className="dark">
      <head>
        <title>Portfolio d'Artisan</title>
        <meta name="description" content="Un portfolio personnel pour un artisan numérique." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/uploads/favico.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground scroll-hover">
        <AuthProvider>
            <AppContent>
                {children}
            </AppContent>
        </AuthProvider>
        <Toaster />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
