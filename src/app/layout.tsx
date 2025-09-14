
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


function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const isLoginPage = pathname === '/login';
  const isAdminPage = pathname.startsWith('/admin');
  const isVideoPage = pathname.startsWith('/video');

  useEffect(() => {
    if (loading) return; 

    if (user && isLoginPage) {
      router.push('/');
      return;
    }

    if (!user && !isLoginPage) {
        router.push('/login');
        return;
    }
  }, [user, loading, isLoginPage, router, pathname]);

  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => e.preventDefault();
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();

    document.body.classList.add('select-none');
    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('copy', preventCopy);

    return () => {
      document.body.classList.remove('select-none');
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('copy', preventCopy);
    };
  }, []);

  if (loading) {
     return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <p className="text-muted-foreground">Chargement de la session...</p>
        </div>
     );
  }
  
  if (!user && !isLoginPage) {
     return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <p className="text-muted-foreground">Redirection vers la connexion...</p>
        </div>
     );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

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
