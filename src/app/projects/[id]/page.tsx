
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export type Project = {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    price: string;
    technologies: string[];
    liveUrl?: string;
    imageUrl: string;
    imageHint: string;
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { firestore } = useFirebase();

  const projectRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'projects', id as string);
  }, [firestore, id]);

  const { data: project, isLoading } = useDoc<Project>(projectRef);
  
  if (isLoading) {
    return (
        <div className="container mx-auto px-0 sm:px-4 py-8 sm:py-16">
            <NeumorphicCard className="max-w-5xl mx-auto p-4 sm:p-8">
                <Skeleton className="h-48 sm:h-96 w-full mb-8" />
                <Skeleton className="h-8 sm:h-10 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <Skeleton className="h-24 w-full" />
            </NeumorphicCard>
        </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Projet non trouvé</h1>
        <p className="text-muted-foreground mt-2">
          Le projet que vous cherchez n'existe pas ou a été déplacé.
        </p>
         <Link href="/" passHref>
            <Button variant="outline" className="mt-8">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
            </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 sm:px-4 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" size="icon" className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark z-10">
              <Link href="/internet">
                  <ArrowLeft className="h-4 w-4" />
              </Link>
          </Button>
        </div>
        <NeumorphicCard className="p-0 sm:p-4 md:p-6">
          <div className="relative mb-8 sm:rounded-2xl overflow-hidden sm:neumorphic-card-inset-light sm:dark:neumorphic-card-inset-dark">
              {project.imageUrl && (project.imageUrl.startsWith('http') || project.imageUrl.startsWith('/')) ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  width={1200}
                  height={600}
                  className="w-full h-auto object-cover"
                  data-ai-hint={project.imageHint}
                />
              ) : (
                  <div className="w-full h-48 sm:h-96 bg-muted flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Pas d'image</span>
                  </div>
              )}
          </div>

          <div className="px-4 sm:px-0">
              <h1 className="text-3xl sm:text-4xl font-bold font-headline">{project.title}</h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-2">
              {project.description}
              </p>

              <Separator className="my-6" />

              <div>
              <h2 className="text-xl font-bold font-headline mb-3">Description Détaillée</h2>
              <p className="text-muted-foreground leading-relaxed">
                  {project.longDescription}
              </p>
              </div>
              
              <Separator className="my-6" />

              <div>
              <h3 className="text-xl font-bold font-headline mb-3">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                  <Badge key={tech} variant="secondary" className="text-sm py-1 px-3 neumorphic-card-light dark:neumorphic-card-dark">
                      {tech}
                  </Badge>
                  ))}
              </div>
              </div>

              <div className="mt-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
                      <p className="text-2xl font-bold font-headline text-primary">{project.price}</p>
                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto btn-neumorphic-light dark:btn-neumorphic-dark">
                              <Link href={project.liveUrl || '#'} target="_blank">
                                  <ExternalLink className="mr-2 h-5 w-5"/>
                                  Visiter le site
                              </Link>
                          </Button>
                          <Button asChild size="lg" className="w-full sm:w-auto btn-neumorphic-light dark:btn-neumorphic-dark">
                          <Link href={`/contract?projectId=${project.id}`}>
                              <ShoppingCart className="mr-2 h-5 w-5"/>
                              Commander
                          </Link>
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}
