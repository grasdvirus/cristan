
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { ContractSubmission } from '@/app/admin/page';
import { NeumorphicCard } from '../neumorphic-card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ExternalLink, Trash2, Code, Phone, Building } from 'lucide-react';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '../ui/badge';

function SubmissionCard({ submission, formatDate, handleDelete }: { submission: ContractSubmission, formatDate: (ts: any) => string, handleDelete: (id: string) => void }) {
  return (
    <NeumorphicCard className="p-4 space-y-3">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold">{submission.fullName}</h3>
                <p className="text-sm text-primary hover:underline"><a href={`mailto:${submission.email}`}>{submission.email}</a></p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(submission.createdAt)}</p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0"><Trash2 className="h-4 w-4" /></Button>
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
        </div>
      
        <div className="space-y-1 text-sm">
            <p className='flex items-center gap-2'><Phone className='w-4 h-4 text-muted-foreground' /> {submission.phone}</p>
            {submission.companyName && <p className='flex items-center gap-2'><Building className='w-4 h-4 text-muted-foreground' /> {submission.companyName}</p>}
        </div>

        <p className="text-sm text-muted-foreground border-t border-b py-2 my-2 border-border/50">{submission.projectDetails}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {submission.promoCode && (
              <div className="flex items-center gap-1 font-mono text-sm"><Code className='w-4 h-4 text-muted-foreground'/>{submission.promoCode}</div>
            )}
            {submission.projectId !== "N/A" ? (
                <Link href={`/projects/${submission.projectId}`} className="hover:underline text-primary flex items-center gap-1">
                    Voir le projet <ExternalLink className="h-3 w-3" />
                </Link>
            ) : (
                <span className='text-muted-foreground'>Aucun projet</span>
            )}
        </div>

    </NeumorphicCard>
  )
}

export function SubmissionsManager({ searchTerm }: { searchTerm: string }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const submissionsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'submissions'), orderBy('createdAt', 'desc')) : null,
        [firestore]
    );
    const { data: submissions, isLoading } = useCollection<ContractSubmission & { type?: string }>(submissionsQuery);

    const filteredSubmissions = useMemo(() => {
        if (!submissions) return [];
        const projectSubmissions = submissions.filter(s => s.type !== 'Partenariat');
        if (!searchTerm) return projectSubmissions;

        return projectSubmissions.filter(s => 
            s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.promoCode && s.promoCode.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [submissions, searchTerm]);

    const formatDate = (timestamp: ContractSubmission['createdAt'] | null) => {
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
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la demande.'});
        }
    };

    return (
        <NeumorphicCard inset className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold font-headline mb-4">Demandes des Clients</h2>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : (
                <>
                <div className="hidden sm:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Entreprise</TableHead>
                                <TableHead>Code Promo</TableHead>
                                <TableHead>Projet</TableHead>
                                <TableHead>Détails</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubmissions?.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell className="font-medium whitespace-nowrap">{formatDate(submission.createdAt)}</TableCell>
                                    <TableCell>{submission.fullName}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <a href={`mailto:${submission.email}`} className="hover:underline text-primary text-xs">{submission.email}</a>
                                            <span className="text-xs text-muted-foreground">{submission.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{submission.companyName || '-'}</TableCell>
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
                                                Voir <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">{submission.projectDetails}</TableCell>
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
                <div className="sm:hidden space-y-4">
                  {filteredSubmissions?.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} formatDate={formatDate} handleDelete={handleDelete} />
                  ))}
                </div>
                </>
            )}
            {!isLoading && filteredSubmissions?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? "Aucune demande ne correspond à votre recherche." : "Aucune demande pour le moment."}
                </p>
            )}
        </NeumorphicCard>
    );
}
