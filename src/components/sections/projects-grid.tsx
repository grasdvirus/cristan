
import Image from 'next/image';
import Link from 'next/link';

import { projectsData } from '@/lib/projects-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardDescription, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

export default function ProjectsGrid() {
  const projectImages = PlaceHolderImages.filter((img) =>
    img.id.startsWith('project-')
  );

  const getProjectImage = (id: string) => {
    return projectImages.find((img) => img.id === id);
  }

  return (
    <section id="projects" className="w-full">
      <div className="columns-2 lg:columns-4 gap-8 space-y-8">
        {projectsData.map((project, index) => {
            const image = getProjectImage(project.id);
            if (!image) return null;

            return (
                <div key={project.id} className="break-inside-avoid">
                    <NeumorphicCard className="group overflow-hidden flex flex-col h-full relative pb-12">
                    <div className="overflow-hidden rounded-lg mb-4">
                        <Image
                        src={image.imageUrl}
                        alt={image.description}
                        width={500}
                        height={350}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={image.imageHint}
                        />
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
            )
        })}
      </div>
    </section>
  );
}
