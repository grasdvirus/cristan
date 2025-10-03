
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { projectsData } from '@/lib/projects-data';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { ContractForm } from '@/components/contract-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function ContractPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  const project = projectsData.find((p) => p.id === projectId);

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <NeumorphicCard className="max-w-4xl mx-auto">
        <div className="relative text-center mb-8">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.back()} 
                className="absolute left-0 top-0 rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
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
            <NeumorphicCard inset className="mt-8 p-4 text-center">
                <h2 className='text-xl font-semibold'>Projet sélectionné : <span className='text-primary'>{project.title}</span></h2>
                <p className='text-muted-foreground mt-1'>Prix : {project.price}</p>
            </NeumorphicCard>
        )}

        <div className="mt-8">
            <ContractForm />
        </div>
      </NeumorphicCard>
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
