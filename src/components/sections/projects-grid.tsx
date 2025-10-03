import Image from 'next/image';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardTitle } from '../ui/card';

export default function ProjectsGrid() {
  const projectImages = PlaceHolderImages.filter((img) =>
    img.id.startsWith('project-')
  );

  return (
    <section id="projects" className="w-full">
      <h2 className="text-3xl font-bold font-headline mb-12 text-center">
        Mes Projets
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {projectImages.map((project, index) => (
          <NeumorphicCard key={project.id} className="group overflow-hidden">
            <div className="overflow-hidden rounded-lg mb-4">
              <Image
                src={project.imageUrl}
                alt={project.description}
                width={500}
                height={350}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={project.imageHint}
              />
            </div>
            <CardTitle className="font-headline text-lg">
              Projet {index + 1}
            </CardTitle>
          </NeumorphicCard>
        ))}
      </div>
    </section>
  );
}
