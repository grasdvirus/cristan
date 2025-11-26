
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardDescription, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Star, Hourglass } from 'lucide-react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";


type Project = {
    id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    imageHint: string;
    rating: number;
    status: 'Disponible' | 'Bientôt disponible';
};

interface ProjectsGridProps {
    projects?: Project[];
    isLoading?: boolean;
}

const StarRating = ({ rating, className }: { rating: number, className?: string }) => (
  <div className={cn("flex", className)}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
            "h-4 w-4",
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
        )}
      />
    ))}
  </div>
);

function ProjectGridSkeleton() {
    return (
        <div className="columns-2 lg:columns-4 gap-8 space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="break-inside-avoid">
                    <NeumorphicCard className="p-0">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-4 space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>
                    </NeumorphicCard>
                </div>
            ))}
        </div>
    );
}

function ProjectsGridInternal({ projects, isLoading }: ProjectsGridProps) {
     if (isLoading) {
        return <ProjectGridSkeleton />;
    }

    if (!projects || projects.length === 0) {
        return <p>Aucun projet trouvé.</p>
    }
    
    // Mélange les projets ici
    const shuffledProjects = useMemo(() => [...projects].sort(() => Math.random() - 0.5), [projects]);

    return (
        <section id="projects" className="w-full">
        <div className="columns-2 lg:columns-4 gap-8 space-y-8">
            {shuffledProjects.map((project) => {
                const isComingSoon = project.status === 'Bientôt disponible';
                return (
                    <div key={project.id} className={cn("break-inside-avoid", isComingSoon && "grayscale opacity-70")}>
                        <NeumorphicCard className="group overflow-hidden flex flex-col h-full p-0">
                            <div className="overflow-hidden relative">
                                {project.imageUrl && (project.imageUrl.startsWith('http') || project.imageUrl.startsWith('/')) ? (
                                    <Image
                                    src={project.imageUrl}
                                    alt={project.title}
                                    width={500}
                                    height={350}
                                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={project.imageHint}
                                    />
                                ) : (
                                    <div className="w-full h-[200px] bg-muted flex items-center justify-center">
                                        <span className="text-sm text-muted-foreground">Pas d'image</span>
                                    </div>
                                )}
                            </div>
                            <div className='flex flex-col flex-grow p-4'>
                                <Badge variant="secondary" className={cn(
                                    'text-xs w-fit mb-2', 
                                    isComingSoon ? 'bg-orange-400 dark:bg-orange-700 text-white dark:text-orange-100' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                )}>
                                    {project.status}
                                </Badge>
                                <CardTitle className="font-headline text-lg">{project.title}</CardTitle>
                                <CardDescription className="mt-2 text-sm text-muted-foreground flex-grow">{project.description}</CardDescription>
                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        <p className='text-lg font-bold font-headline text-primary'>{project.price}</p>
                                        <StarRating rating={project.rating || 0} className="mt-1" />
                                    </div>
                                    {isComingSoon ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <Button size="icon" className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                                                    <Plus className="h-4 w-4" />
                                                    <span className="sr-only">Information</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl">
                                                <AlertDialogHeader>
                                                    <div className="flex justify-center mb-4">
                                                        <Hourglass className="h-12 w-12 text-primary" />
                                                    </div>
                                                    <AlertDialogTitle className="text-center">Bientôt Disponible !</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-center">
                                                        Ce projet est en cours de finalisation et sera disponible très prochainement.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogCancel asChild>
                                                    <Button className='w-full btn-neumorphic-light dark:btn-neumorphic-dark rounded-full'>Fermer</Button>
                                                </AlertDialogCancel>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <Button asChild size="icon" className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                                            <Link href={`/projects/${project.id}`}>
                                                <Plus className="h-4 w-4" />
                                                <span className="sr-only">Détails</span>
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </NeumorphicCard>
                    </div>
                )
            })}
        </div>
        </section>
    );
}

export default function ProjectsGrid(props: ProjectsGridProps) {
    const { firestore } = useFirebase();
    const projectsQuery = useMemoFirebase(() => {
        if (props.projects || !firestore) return null;
        return query(collection(firestore, 'projects'));
    }, [firestore, props.projects]);
    
    const { data: fetchedProjects, isLoading: isFetching } = useCollection<Project>(projectsQuery);

    const projects = props.projects ?? fetchedProjects;
    const isLoading = props.isLoading ?? isFetching;

    return <ProjectsGridInternal projects={projects} isLoading={isLoading} />
}
