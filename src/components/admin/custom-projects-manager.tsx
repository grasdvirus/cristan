'use client';

import { useMemo, useState } from 'react';
import { useFirebase } from '@/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { CustomProjectSubmission } from '@/app/admin/page';
import { NeumorphicCard } from '../neumorphic-card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, MoreVertical, Eye, CheckCircle, Briefcase, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';

interface CustomProjectsManagerProps {
    submissions?: (any)[];
    isLoading?: boolean;
    searchTerm?: string;
}

const DetailRow = ({ label, value }: { label: string, value?: string }) => (
    value ? (
        <div className="grid grid-cols-3 gap-2">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="col-span-2 text-sm">{value}</dd>
        </div>
    ) : null
);

export function CustomProjectsManager({ submissions, isLoading, searchTerm = '' }: CustomProjectsManagerProps) {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const filteredSubmissions = useMemo(() => {
        if (!submissions) return [];
        const customProjectSubmissions = submissions.filter(s => s.type === 'Projet Personnalisé') as CustomProjectSubmission[];
        if (!searchTerm) return customProjectSubmissions;

        return customProjectSubmissions.filter(s => 
            s.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.companyName && s.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [submissions, searchTerm]);

    const formatDate = (timestamp: CustomProjectSubmission['createdAt'] | null) => {
        if (!timestamp) return 'Date inconnue';
        const date = new Date(timestamp.seconds * 1000);
        return format(date, "d MMM yy, HH:mm", { locale: fr });
    };

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'submissions', id));
            toast({ variant: 'success', title: 'Demande supprimée.' });
        } catch (error) {
            console.error('Error deleting submission', error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la demande.' });
        }
    };
    
    const handleStatusChange = async (id: string, status: CustomProjectSubmission['status']) => {
        if (!firestore) return;
        const subRef = doc(firestore, 'submissions', id);
        try {
            await updateDoc(subRef, { status });
            toast({ variant: 'success', title: 'Statut mis à jour !' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
        }
    };

    if (isLoading) {
        return <NeumorphicCard inset className="p-6"><Skeleton className="h-64 w-full" /></NeumorphicCard>;
    }
    
    return (
        <NeumorphicCard inset className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold font-headline mb-4">Demandes de Projets sur Mesure</h2>
            {filteredSubmissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune demande de projet sur mesure.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Nom du Projet</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubmissions.map((sub) => (
                            <TableRow key={sub.id}>
                                <TableCell className="font-medium whitespace-nowrap">{formatDate(sub.createdAt)}</TableCell>
                                <TableCell>{sub.projectName}</TableCell>
                                <TableCell>{sub.contact}</TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "capitalize",
                                        sub.status === 'Nouveau' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
                                        sub.status === 'Vu' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-400',
                                        sub.status === 'En cours' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
                                        sub.status === 'Terminé' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300'
                                    )} variant="outline">
                                        {sub.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon"><Info className="h-4 w-4" /></Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>{sub.projectName}</DialogTitle>
                                                <DialogDescription>Détails de la demande de projet sur mesure.</DialogDescription>
                                            </DialogHeader>
                                            <Separator />
                                            <dl className="space-y-3 py-4">
                                                <DetailRow label="Date" value={formatDate(sub.createdAt)} />
                                                <DetailRow label="Statut" value={sub.status} />
                                                <DetailRow label="Contact" value={sub.contact} />
                                                <DetailRow label="Source" value={sub.howYouFoundUs} />
                                                <DetailRow label="Entreprise" value={sub.companyName} />
                                                <DetailRow label="Description (Entreprise)" value={sub.companyDescription} />
                                                <Separator />
                                                <div className="space-y-1">
                                                    <dt className="text-sm font-medium text-muted-foreground">Cahier des charges</dt>
                                                    <dd className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{sub.projectBrief}</dd>
                                                </div>
                                            </dl>
                                        </DialogContent>
                                    </Dialog>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleStatusChange(sub.id, 'Vu')}><Eye className="mr-2 h-4 w-4 text-gray-500"/> Marquer comme vu</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(sub.id, 'En cours')}><Briefcase className="mr-2 h-4 w-4 text-yellow-500"/> Mettre en cours</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(sub.id, 'Terminé')}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Marquer comme terminé</DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:bg-accent focus:text-accent-foreground">
                                                    <Trash2 className="mr-2 h-4 w-4"/> Supprimer
                                                </div></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                                    <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(sub.id)}>Supprimer</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </NeumorphicCard>
    );
}