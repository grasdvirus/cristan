
'use client';

import { useState } from 'react';
import { collection, query, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Plus, Shield, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { SlideForm } from '@/components/admin/slide-form';
import { ProjectForm, type ProjectFormValues } from '@/components/admin/project-form';
import { VideoForm, type VideoFormValues } from '@/components/admin/video-form';
import { GameForm, type GameFormValues } from '@/components/admin/game-form';
import { SubmissionsManager } from '@/components/admin/submissions-manager';
import { convertToEmbedUrl } from '@/lib/utils';
import { AuthGuard } from '@/components/auth-guard';

// Define types based on backend.json
export type Slide = {
    id: string;
    description: string;
    imageUrl: string;
    imageHint?: string;
};

export type Project = {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    price: string;
    technologies: string[];
    liveUrl?: string;
    imageUrl: string;
    imageHint?: string;
};

export type Video = {
    id: string;
    title: string;
    uploadDate?: string;
    views?: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    thumbnailHint?: string;
};

export type Game = {
    id: string;
    title: string;
    description: string;
    category: string;
    affiliateUrl: string;
    imageUrl: string;
    imageHint?: string;
};

export type ContractSubmission = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    companyName?: string;
    projectDetails: string;
    projectId: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};


function SlidesManager() {
    const { firestore } = useFirebase();
    const slidesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'slides')) : null, [firestore]);
    const { data: slides, isLoading } = useCollection<Slide>(slidesQuery);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

    const handleFormSubmit = async (values: { description: string, imageUrl: string, imageHint?: string }) => {
        if (!firestore) return;
        setIsSubmitting(true);

        try {
            if (editingSlide) {
                await updateDoc(doc(firestore, 'slides', editingSlide.id), values);
            } else {
                await addDoc(collection(firestore, 'slides'), values);
            }
            toast({ variant: 'success', title: `Slide ${editingSlide ? 'modifié' : 'ajouté'} avec succès.` });
            setDialogOpen(false);
            setEditingSlide(null);
        } catch (error) {
            console.error("Error saving slide: ", error);
            toast({ title: 'Erreur', description: `Impossible de sauvegarder le slide.`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'slides', id));
            toast({ variant: 'success', title: 'Slide supprimé.' });
        } catch (error) {
            console.error("Error deleting slide: ", error);
            toast({ title: 'Erreur', description: 'Impossible de supprimer le slide.', variant: 'destructive' });
        }
    };

    const openEditDialog = (slide: Slide) => {
        setEditingSlide(slide);
        setDialogOpen(true);
    };

    const openAddDialog = () => {
        setEditingSlide(null);
        setDialogOpen(true);
    };

    return (
        <NeumorphicCard inset className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-headline">Gestion des Slides</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog} className="btn-neumorphic-light dark:btn-neumorphic-dark">
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un slide
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSlide ? 'Modifier' : 'Ajouter'} un slide</DialogTitle>
                        </DialogHeader>
                        <SlideForm
                            initialData={editingSlide}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            {isLoading ? <Skeleton className="h-40 w-full" /> : (
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
                                {(slide.imageUrl.startsWith('http') || slide.imageUrl.startsWith('/')) ? (
                                    <Image src={slide.imageUrl} alt={slide.description} width={80} height={45} className="rounded-md object-cover" />
                                ): <div className="w-20 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">URL Invalide</div>}
                            </TableCell>
                            <TableCell className="font-medium">{slide.description}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(slide)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>Cette action est irréversible et supprimera définitivement le slide.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(slide.id)}>Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            )}
        </NeumorphicCard>
    );
}

function ProjectsManager() {
    const { firestore } = useFirebase();
    const projectsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'projects')) : null, [firestore]);
    const { data: projects, isLoading } = useCollection<Project>(projectsQuery);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const handleFormSubmit = async (values: ProjectFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);
        const dataToSave = {
            ...values,
            technologies: values.technologies.split(',').map(tech => tech.trim()),
            price: `${values.price.replace(/ FCFA/g, '')} FCFA`,
        };

        try {
            if (editingProject) {
                await updateDoc(doc(firestore, 'projects', editingProject.id), dataToSave);
            } else {
                await addDoc(collection(firestore, 'projects'), dataToSave);
            }
            toast({ variant: 'success', title: `Projet ${editingProject ? 'modifié' : 'ajouté'} avec succès.` });
            setDialogOpen(false);
            setEditingProject(null);
        } catch (error) {
            console.error("Error saving project: ", error);
            toast({ title: 'Erreur', description: `Impossible de sauvegarder le projet.`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'projects', id));
            toast({ variant: 'success', title: 'Projet supprimé.' });
        } catch (error) {
            console.error("Error deleting project: ", error);
            toast({ title: 'Erreur', description: 'Impossible de supprimer le projet.', variant: 'destructive' });
        }
    };
    
    const openEditDialog = (project: Project) => {
        setEditingProject(project);
        setDialogOpen(true);
    };

    const openAddDialog = () => {
        setEditingProject(null);
        setDialogOpen(true);
    };

    return (
        <NeumorphicCard inset className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-headline">Gestion des Projets</h2>
                 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog} className="btn-neumorphic-light dark:btn-neumorphic-dark">
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un projet
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingProject ? 'Modifier' : 'Ajouter'} un projet</DialogTitle>
                        </DialogHeader>
                        <ProjectForm 
                            initialData={editingProject}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            { isLoading ? <Skeleton className="h-40 w-full" /> : (
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
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>Cette action est irréversible et supprimera définitivement le projet.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(project.id)}>Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            )}
        </NeumorphicCard>
    );
}

function VideosManager() {
    const { firestore } = useFirebase();
    const videosQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'videos')) : null, [firestore]);
    const { data: videos, isLoading } = useCollection<Video>(videosQuery);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);

    const handleFormSubmit = async (values: VideoFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);
        const dataToSave = {
            ...values,
            videoUrl: convertToEmbedUrl(values.videoUrl),
            uploadDate: values.uploadDate || format(new Date(), 'dd MMMM yyyy'),
            views: values.views || '0 vues',
        };
        try {
            if (editingVideo) {
                await updateDoc(doc(firestore, 'videos', editingVideo.id), dataToSave);
            } else {
                await addDoc(collection(firestore, 'videos'), dataToSave);
            }
            toast({ variant: 'success', title: `Vidéo ${editingVideo ? 'modifiée' : 'ajoutée'} avec succès.` });
            setDialogOpen(false);
            setEditingVideo(null);
        } catch (error) {
            console.error("Error saving video: ", error);
            toast({ title: 'Erreur', description: `Impossible de sauvegarder la vidéo.`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'videos', id));
            toast({ variant: 'success', title: 'Vidéo supprimée.' });
        } catch (error) {
            console.error("Error deleting video: ", error);
            toast({ title: 'Erreur', description: 'Impossible de supprimer la vidéo.', variant: 'destructive' });
        }
    };

    const openEditDialog = (video: Video) => {
        setEditingVideo(video);
        setDialogOpen(true);
    };

    const openAddDialog = () => {
        setEditingVideo(null);
        setDialogOpen(true);
    };

    return (
        <NeumorphicCard inset className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-headline">Gestion des Vidéos</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog} className="btn-neumorphic-light dark:btn-neumorphic-dark">
                            <Plus className="mr-2 h-4 w-4" /> Ajouter une vidéo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingVideo ? 'Modifier' : 'Ajouter'} une vidéo</DialogTitle>
                        </DialogHeader>
                        <VideoForm
                            initialData={editingVideo}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            { isLoading ? <Skeleton className="h-40 w-full" /> : (
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
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(video)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>Cette action est irréversible et supprimera définitivement la vidéo.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(video.id)}>Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            )}
        </NeumorphicCard>
    );
}

function GamesManager() {
    const { firestore } = useFirebase();
    const gamesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'games')) : null, [firestore]);
    const { data: games, isLoading } = useCollection<Game>(gamesQuery);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);

    const handleFormSubmit = async (values: GameFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        try {
            if (editingGame) {
                await updateDoc(doc(firestore, 'games', editingGame.id), values);
            } else {
                await addDoc(collection(firestore, 'games'), values);
            }
            toast({ variant: 'success', title: `Jeu ${editingGame ? 'modifié' : 'ajouté'} avec succès.` });
            setDialogOpen(false);
            setEditingGame(null);
        } catch (error) {
            console.error("Error saving game: ", error);
            toast({ title: 'Erreur', description: `Impossible de sauvegarder le jeu.`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'games', id));
            toast({ variant: 'success', title: 'Jeu supprimé.' });
        } catch (error) {
            console.error("Error deleting game: ", error);
            toast({ title: 'Erreur', description: 'Impossible de supprimer le jeu.', variant: 'destructive' });
        }
    };

    const openEditDialog = (game: Game) => {
        setEditingGame(game);
        setDialogOpen(true);
    };

    const openAddDialog = () => {
        setEditingGame(null);
        setDialogOpen(true);
    };

    return (
        <NeumorphicCard inset className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-headline">Gestion de la Gamme</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog} className="btn-neumorphic-light dark:btn-neumorphic-dark">
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un jeu
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingGame ? 'Modifier' : 'Ajouter'} un jeu</DialogTitle>
                        </DialogHeader>
                        <GameForm
                            initialData={editingGame}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            { isLoading ? <Skeleton className="h-40 w-full" /> : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {games?.map((game) => (
                        <TableRow key={game.id}>
                            <TableCell className="font-medium">{game.title}</TableCell>
                            <TableCell>{game.category}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(game)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>Cette action est irréversible et supprimera définitivement le jeu.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(game.id)}>Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            )}
        </NeumorphicCard>
    );
}

function AdminPageContent() {
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
                    <TabsList className="mb-8 grid w-full grid-cols-5">
                        <TabsTrigger value="slides">Slides</TabsTrigger>
                        <TabsTrigger value="internet">Internet</TabsTrigger>
                        <TabsTrigger value="tv">TV</TabsTrigger>
                        <TabsTrigger value="games">Gamme</TabsTrigger>
                        <TabsTrigger value="submissions">Demandes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="slides">
                        <SlidesManager />
                    </TabsContent>

                    <TabsContent value="internet">
                        <ProjectsManager />
                    </TabsContent>

                    <TabsContent value="tv">
                        <VideosManager />
                    </TabsContent>

                    <TabsContent value="games">
                        <GamesManager />
                    </TabsContent>

                    <TabsContent value="submissions">
                        <SubmissionsManager />
                    </TabsContent>
                </Tabs>
            </NeumorphicCard>
        </div>
    );
}

export default function AdminPage() {
    return (
        <AuthGuard>
            <AdminPageContent />
        </AuthGuard>
    )
}
