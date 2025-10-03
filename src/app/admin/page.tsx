
'use client';

import { collection, query } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Plus, Shield, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

// Define types based on backend.json
type Slide = {
    id: string;
    description: string;
    imageUrl: string;
};

type Project = {
    id: string;
    title: string;
    description: string;
    price: string;
};

type Video = {
    id: string;
    title: string;
    uploadDate: string;
    views: string;
    thumbnailUrl: string;
};


function SlidesTable() {
    const { firestore } = useFirebase();
    const slidesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'slides')) : null, [firestore]);
    const { data: slides, isLoading } = useCollection<Slide>(slidesQuery);

    if (isLoading) {
        return <Skeleton className="h-40 w-full" />;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {slides?.map((slide) => (
                    <TableRow key={slide.id}>
                        <TableCell>
                            <Image src={slide.imageUrl} alt={slide.description} width={80} height={45} className="rounded-md object-cover" />
                        </TableCell>
                        <TableCell className="font-medium">{slide.description}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function ProjectsTable() {
    const { firestore } = useFirebase();
    const projectsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'projects')) : null, [firestore]);
    const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

    if (isLoading) {
        return <Skeleton className="h-40 w-full" />;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {projects?.map((project) => (
                    <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>{project.description}</TableCell>
                        <TableCell>{project.price}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function VideosTable() {
    const { firestore } = useFirebase();
    const videosQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'videos')) : null, [firestore]);
    const { data: videos, isLoading } = useCollection<Video>(videosQuery);

    if (isLoading) {
        return <Skeleton className="h-40 w-full" />;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Date de publication</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {videos?.map((video) => (
                    <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.title}</TableCell>
                        <TableCell>{video.uploadDate}</TableCell>
                        <TableCell>{video.views}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}


export default function AdminPage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <NeumorphicCard className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Shield className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl font-bold font-headline">Panneau d'administration</h1>
                </div>
                <p className="text-muted-foreground mb-8">
                    Gérez le contenu de votre site web à partir de cet espace.
                </p>

                <Tabs defaultValue="slides">
                    <TabsList className="mb-8 grid w-full grid-cols-3">
                        <TabsTrigger value="slides">Slides</TabsTrigger>
                        <TabsTrigger value="internet">Internet</TabsTrigger>
                        <TabsTrigger value="tv">TV</TabsTrigger>
                    </TabsList>

                    {/* Slides Management */}
                    <TabsContent value="slides">
                        <NeumorphicCard inset className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold font-headline">Gestion des Slides</h2>
                                <Button className="btn-neumorphic-light dark:btn-neumorphic-dark">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter un slide
                                </Button>
                            </div>
                            <SlidesTable />
                        </NeumorphicCard>
                    </TabsContent>

                    {/* Projects Management */}
                    <TabsContent value="internet">
                        <NeumorphicCard inset className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold font-headline">Gestion des Projets</h2>
                                <Button className="btn-neumorphic-light dark:btn-neumorphic-dark">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter un projet
                                </Button>
                            </div>
                            <ProjectsTable />
                        </NeumorphicCard>
                    </TabsContent>

                    {/* Videos Management */}
                    <TabsContent value="tv">
                        <NeumorphicCard inset className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold font-headline">Gestion des Vidéos</h2>
                                <Button className="btn-neumorphic-light dark:btn-neumorphic-dark">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une vidéo
                                </Button>
                            </div>
                            <VideosTable />
                        </NeumorphicCard>
                    </TabsContent>
                </Tabs>
            </NeumorphicCard>
        </div>
    );
}
