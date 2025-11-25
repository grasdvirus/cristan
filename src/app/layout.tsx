import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppContent } from '@/components/layout/app-content';

export const metadata: Metadata = {
  title: 'Mon Portfolio Personnel',
  description: 'Un portfolio personnel moderne avec un style neumorphique.',
  icons: {
    icon: '/favico.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppContent>{children}</AppContent>
      </body>
    </html>
  );
}
