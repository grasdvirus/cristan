
'use client';

import { Suspense } from 'react';
import { CustomProjectForm } from '@/components/custom-project-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function CustomProjectPageContent() {
  return (
    <div className="container mx-auto px-0 sm:px-4 py-16 sm:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="relative text-center mb-12 px-4">
            <Button 
                asChild
                variant="ghost" 
                size="icon"
                className="absolute left-4 sm:left-0 top-1/2 -translate-y-1/2 rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                aria-label="Retour"
            >
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <h1 className="text-4xl font-bold font-headline">Projet sur Mesure</h1>
            <p className="text-muted-foreground mt-2">
                Suivez les étapes pour nous décrire le projet de vos rêves.
            </p>
        </div>
        
        <div className="mt-8 mx-4 sm:mx-0">
            <CustomProjectForm />
        </div>

      </div>
    </div>
  );
}

export default function CustomProjectPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <CustomProjectPageContent />
        </Suspense>
    )
}
