'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { ContractForm } from '@/components/contract-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AuthGuard } from '@/components/auth-guard';
import Link from 'next/link';

type Project = {
    id: string;
    title: string;
    price: string;
}

function ContractPageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  // This page is now only for 'Projet' or general 'Contact'
  const type = 'Projet'; 
  
  const { firestore } = useFirebase();
  const projectRef = useMemoFirebase(() => {
    if (!firestore || !projectId) return null;
    return doc(firestore, 'projects', projectId);
  }, [firestore, projectId]);
  const { data: project, isLoading } = useDoc<Project>(projectRef);

  const getTitle = () => {
    if (project) return 'Formulaire de Commande';
    return 'Formulaire de Contact';
  }

  const getDescription = () => {
    if (project) return 'Veuillez remplir les informations ci-dessous pour démarrer votre projet.';
    return 'Laissez-nous un message et nous vous recontacterons rapidement.'
  }

  return (
    <div className="container mx-auto px-0 sm:px-4 py-16 sm:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="relative text-center mb-8 px-4">
            <Button 
                asChild
                variant="ghost" 
                size="icon"
                className="absolute left-4 top-0 rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                aria-label="Retour"
            >
                <Link href={projectId ? `/projects/${projectId}` : '/'}>
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <h1 className="text-4xl font-bold font-headline">{getTitle()}</h1>
            <p className="text-muted-foreground mt-2">
                {getDescription()}
            </p>
        </div>

        {project && (
            <NeumorphicCard inset className="mt-8 mx-4 sm:mx-0 p-4 text-center">
                <h2 className='text-xl font-semibold'>Projet sélectionné : <span className='text-primary'>{project.title}</span></h2>
                <p className='text-muted-foreground mt-1'>Prix : {project.price}</p>
            </NeumorphicCard>
        )}
         {isLoading && projectId && (
             <NeumorphicCard inset className="mt-8 mx-4 sm:mx-0 p-4 text-center">
                 <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
                 <div className="h-4 bg-muted rounded w-1/4 mx-auto mt-2"></div>
             </NeumorphicCard>
         )}

        <div className="mt-8 sm:p-0">
            <ContractForm projectId={projectId} />
        </div>
      </div>
    </div>
  );
}


export default function ContractPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <AuthGuard>
                <ContractPageContent />
            </AuthGuard>
        </Suspense>
    )
}
