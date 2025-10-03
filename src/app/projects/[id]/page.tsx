
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { projectsData, Project } from '@/lib/projects-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailsPage() {
  const params = useParams();
  const { id } = params;

  const project: Project | undefined = projectsData.find((p) => p.id === id);
  const projectImage = PlaceHolderImages.find((img) => img.id === id);

  if (!project || !projectImage) {
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
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <NeumorphicCard className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Column */}
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl">
                <Image
                    src={projectImage.imageUrl}
                    alt={project.title}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                    data-ai-hint={projectImage.imageHint}
                />
            </div>
             <div className="hidden md:grid grid-cols-3 gap-4">
                {PlaceHolderImages.slice(1, 4).map(thumb => (
                     <div key={thumb.id} className="overflow-hidden rounded-lg">
                        <Image
                            src={thumb.imageUrl}
                            alt={thumb.description}
                            width={200}
                            height={150}
                            className="w-full h-auto object-cover"
                            data-ai-hint={thumb.imageHint}
                        />
                    </div>
                ))}
            </div>
          </div>

          {/* Details Column */}
          <div className="flex flex-col">
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

            <div className="mt-auto pt-8">
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
                    <p className="text-2xl font-bold font-headline text-primary">{project.price}</p>
                    <div className="flex items-center gap-2">
                        <Button asChild size="lg" variant="outline" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                            <Link href={project.liveUrl || '#'} target="_blank">
                                <ExternalLink className="mr-2 h-5 w-5"/>
                                Visiter le site
                            </Link>
                        </Button>
                        <Button asChild size="lg" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                          <Link href={`/contract?projectId=${project.id}`}>
                            <ShoppingCart className="mr-2 h-5 w-5"/>
                            Commander
                          </Link>
                        </Button>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
}
