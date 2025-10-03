import Image from 'next/image';
import Link from 'next/link';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { CardTitle } from '../ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProjectsGrid() {
  const projectImages = PlaceHolderImages.filter((img) =>
    img.id.startsWith('project-')
  ).slice(0, 4);

  return (
    <section id="projects" className="w-full">
        <div className="mb-12">
            <div className="flex justify-center gap-12 text-center text-muted-foreground font-headline">
                <Link href="#projects" className="group">
                    <span className="text-lg">site web</span>
                    <Separator className="mt-2 h-0.5 w-full bg-primary transition-all duration-300 group-hover:bg-primary/70"/>
                </Link>
                <Link href="#videos" className="group">
                    <span className="text-lg">vidéo</span>
                    <Separator className="mt-2 h-0.5 w-full bg-border transition-all duration-300 group-hover:bg-primary/70"/>
                </Link>
            </div>
      </div>

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
            <CardTitle className="font-headline text-lg">Projet {index + 1}</CardTitle>
          </NeumorphicCard>
        ))}
      </div>
    </section>
  );
}
