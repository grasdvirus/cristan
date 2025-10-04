
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
  const params = useParams();
  const { id } = params;
  const { firestore } = useFirebase();

  const projectRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'projects', id as string);
  }, [firestore, id]);

  const { data: project, isLoading } = useDoc<Project>(projectRef);
  
  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <NeumorphicCard className="max-w-5xl mx-auto p-8">
                <Skeleton className="h-96 w-full mb-8" />
                <Skeleton className="h-10 w-3/4 mb-4" />
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
    <div className="w-full">
        {/* Image Section - Full width on mobile */}
        <div className="relative w-full h-auto md:max-w-5xl md:mx-auto md:rounded-2xl md:overflow-hidden md:mt-16">
            {project.imageUrl && (project.imageUrl.startsWith('http') || project.imageUrl.startsWith('/')) ? (
                <Image
                    src={project.imageUrl}
                    alt={project.title}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover"
                    data-ai-hint={project.imageHint}
                />
            ) : (
                <div className="w-full h-[60vh] bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Pas d'image</span>
                </div>
            )}
        </div>

        {/* Details Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <NeumorphicCard className="max-w-5xl mx-auto -mt-16 md:-mt-24 relative z-10 p-6 md:p-8">
                <Link href="/#projects" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux projets
                </Link>

                <h1 className="text-4xl font-bold font-headline">{project.title}</h1>
                <p className="text-lg text-muted-foreground mt-2">
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
            </NeumorphicCard>
        </div>
    </div>
  );
}
