
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { ContractForm } from '@/components/contract-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

type Project = {
    id: string;
    title: string;
    price: string;
}

function ContractPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  
  const { firestore } = useFirebase();
  const projectRef = useMemoFirebase(() => {
    if (!firestore || !projectId) return null;
    return doc(firestore, 'projects', projectId);
  }, [firestore, projectId]);
  const { data: project, isLoading } = useDoc<Project>(projectRef);

  return (
    <div className="container mx-auto px-0 sm:px-4 py-16 sm:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="relative text-center mb-8 px-4">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.back()} 
                className="absolute left-4 top-0 rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                aria-label="Retour"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold font-headline">Formulaire de Commande</h1>
            <p className="text-muted-foreground mt-2">
                Veuillez remplir les informations ci-dessous pour démarrer votre projet.
            </p>
        </div>

        {project && (
            <NeumorphicCard inset className="mt-8 mx-4 sm:mx-0 p-4 text-center">
                <h2 className='text-xl font-semibold'>Projet sélectionné : <span className='text-primary'>{project.title}</span></h2>
                <p className='text-muted-foreground mt-1'>Prix : {project.price}</p>
            </NeumorphicCard>
        )}
         {isLoading && (
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
            <ContractPageContent />
        </Suspense>
    )
}
