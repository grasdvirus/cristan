
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
                    <NeumorphicCard className="space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-6 w-1/4" />
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
                    <NeumorphicCard className="group overflow-hidden flex flex-col h-full relative pb-12">
                    <div className="overflow-hidden rounded-lg mb-4">
                        {project.imageUrl && (
                            <Image
                            src={project.imageUrl}
                            alt={project.title}
                            width={500}
                            height={350}
                            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={project.imageHint}
                            />
                        )}
                    </div>
                    <div className='flex flex-col flex-grow p-0'>
                        <CardTitle className="font-headline text-lg">{project.title}</CardTitle>
                        <CardDescription className="mt-2 text-sm text-muted-foreground flex-grow">{project.description}</CardDescription>
                        <p className='text-lg font-bold font-headline text-primary mt-4'>{project.price}</p>
                    </div>
                     <Button asChild size="icon" className="rounded-full absolute bottom-4 right-4 btn-neumorphic-light dark:btn-neumorphic-dark">
                        <Link href={`/projects/${project.id}`}>
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Détails</span>
                        </Link>
                     </Button>
                    </NeumorphicCard>
                </div>
            ))}
        </div>
        </section>
    );
}
