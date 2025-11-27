
'use client';

import { useState } from 'react';
import { collection, query, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { useToast } from '@/components/ui/use-toast';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PresentationAudioForm, type PresentationAudioFormValues } from './presentation-audio-form';

export type PresentationAudio = {
  id: string;
  title: string;
  text: string;
  updatedAt?: any;
}

export function PresentationAudioScriptManager() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingScript, setEditingScript] = useState<PresentationAudio | null>(null);

    const scriptsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'presentationAudioScripts'));
    }, [firestore]);

    const { data: scripts, isLoading } = useCollection<PresentationAudio>(scriptsQuery);

    const handleFormSubmit = async (values: PresentationAudioFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);

        const dataToSave = {
            ...values,
            updatedAt: serverTimestamp(),
        };

        try {
            if (editingScript) {
                await updateDoc(doc(firestore, 'presentationAudioScripts', editingScript.id), dataToSave);
                toast({ variant: 'success', title: `Script "${values.title}" modifié avec succès.` });
            } else {
                await addDoc(collection(firestore, 'presentationAudioScripts'), dataToSave);
                toast({ variant: 'success', title: `Script "${values.title}" ajouté avec succès.` });
            }
            setDialogOpen(false);
            setEditingScript(null);
        } catch (error) {
            console.error("Error saving script: ", error);
            toast({ title: 'Erreur', description: `Impossible de sauvegarder le script.`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'presentationAudioScripts', id));
            toast({ variant: 'success', title: 'Script supprimé.' });
        } catch (error) {
            console.error("Error deleting script: ", error);
            toast({ title: 'Erreur', description: 'Impossible de supprimer le script.', variant: 'destructive' });
        }
    };

    const openEditDialog = (script: PresentationAudio) => {
        setEditingScript(script);
        setDialogOpen(true);
    };

    const openAddDialog = () => {
        setEditingScript(null);
        setDialogOpen(true);
    };

    return (
        <NeumorphicCard inset className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold font-headline">Gestion des Scripts Audio</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog} className="btn-neumorphic-light dark:btn-neumorphic-dark w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un script
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingScript ? 'Modifier' : 'Ajouter'} un script</DialogTitle>
                        </DialogHeader>
                        <PresentationAudioForm
                            initialData={editingScript}
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
                        <TableHead>Titre</TableHead>
                        <TableHead>Contenu</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {scripts?.map((script) => (
                        <TableRow key={script.id}>
                            <TableCell className="font-medium">{script.title}</TableCell>
                            <TableCell className="max-w-md truncate">{script.text}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(script)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>Cette action est irréversible et supprimera définitivement le script.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(script.id)}>Supprimer</AlertDialogAction>
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
