
'use client';

import Image from 'next/image';
import Link from 'next/link';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardDescription, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Skeleton } from '../ui/skeleton';

type Project = {
    id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    imageHint: string;
};

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

export default function ProjectsGrid() {
    const { firestore } = useFirebase();
    const projectsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'projects')) : null, [firestore]);
    const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

    if (isLoading) {
        return <ProjectGridSkeleton />;
    }

    if (!projects || projects.length === 0) {
        return <p>Aucun projet trouvé.</p>
    }

    return (
        <section id="projects" className="w-full">
        <div className="columns-2 lg:columns-4 gap-8 space-y-8">
            {projects.map((project) => (
                <div key={project.id} className="break-inside-avoid">
                    <NeumorphicCard className="group overflow-hidden flex flex-col h-full p-0">
                        <div className="overflow-hidden">
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
                            <CardTitle className="font-headline text-lg">{project.title}</CardTitle>
                            <CardDescription className="mt-2 text-sm text-muted-foreground flex-grow">{project.description}</CardDescription>
                            <div className="flex justify-between items-center mt-4">
                                <p className='text-lg font-bold font-headline text-primary'>{project.price}</p>
                                <Button asChild size="icon" className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                                    <Link href={`/projects/${project.id}`}>
                                        <Plus className="h-4 w-4" />
                                        <span className="sr-only">Détails</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </NeumorphicCard>
                </div>
            ))}
        </div>
        </section>
    );
}
