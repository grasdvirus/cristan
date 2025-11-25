'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { LoadingSpinner } from '@/components/loading-spinner';

export function AppContent({ children }: { children: React.ReactNode }) {

  return (
    <FirebaseClientProvider>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    </FirebaseClientProvider>
  );
}
