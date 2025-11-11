
'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { ContractSubmission } from '@/app/admin/page';
import { NeumorphicCard } from '../neumorphic-card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ExternalLink, Trash2, Code } from 'lucide-react';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '../ui/badge';

export function SubmissionsManager() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const submissionsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'submissions'), orderBy('createdAt', 'desc')) : null,
        [firestore]
    );
    const { data: submissions, isLoading } = useCollection<ContractSubmission & { type?: string }>(submissionsQuery);

    const formatDate = (timestamp: ContractSubmission['createdAt'] | null) => {
        if (!timestamp) return 'Date inconnue';
        const date = new Date(timestamp.seconds * 1000);
        return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
    };
    
    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'submissions', id));
            toast({ variant: 'success', title: 'Demande supprimée.' });
        } catch (error) {
            console.error('Error deleting submission', error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la demande.'});
        }
    };

    return (
        <NeumorphicCard inset className="p-6">
            <h2 className="text-2xl font-bold font-headline mb-4">Demandes des Clients</h2>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Code Promo</TableHead>
                                <TableHead>Projet Lié</TableHead>
                                <TableHead>Détails</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions?.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell className="font-medium whitespace-nowrap">{formatDate(submission.createdAt)}</TableCell>
                                    <TableCell>
                                        <Badge variant={submission.type === 'Partenariat' ? 'default' : 'secondary'}>
                                            {submission.type || 'Projet'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{submission.fullName}</TableCell>
                                    <TableCell><a href={`mailto:${submission.email}`} className="hover:underline text-primary">{submission.email}</a></TableCell>
                                    <TableCell>
                                        {submission.promoCode ? (
                                            <span className='flex items-center gap-1 font-mono text-sm'><Code className='w-4 h-4 text-muted-foreground'/>{submission.promoCode}</span>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {submission.projectId !== "N/A" ? (
                                            <Link href={`/projects/${submission.projectId}`} className="hover:underline text-primary flex items-center gap-1">
                                                Voir le projet <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{submission.projectDetails}</TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                                <AlertDialogDescription>Cette action est irréversible et supprimera définitivement la demande.</AlertDialogDescription>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(submission.id)}>Supprimer</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            {!isLoading && submissions?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Aucune demande pour le moment.</p>
            )}
        </NeumorphicCard>
    );
}
