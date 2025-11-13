

'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { ContractSubmission } from '@/app/admin/page';
import { NeumorphicCard } from '../neumorphic-card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ExternalLink, Trash2, Code, Phone, Building, MoreVertical, Eye, CheckCircle, Briefcase } from 'lucide-react';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

function SubmissionCard({ submission, formatDate, handleDelete, handleStatusChange }: { submission: ContractSubmission, formatDate: (ts: any) => string, handleDelete: (id: string) => void, handleStatusChange: (id: string, status: ContractSubmission['status']) => void }) {
  return (
    <NeumorphicCard className="p-4 space-y-3">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold">{submission.fullName}</h3>
                <p className="text-sm text-primary hover:underline"><a href={`mailto:${submission.email}`}>{submission.email}</a></p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(submission.createdAt)}</p>
                 <div className="mt-2">
                    <Badge className={cn(
                        "capitalize",
                        submission.status === 'Nouveau' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
                        submission.status === 'Vu' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-400',
                        submission.status === 'En cours' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
                        submission.status === 'Terminé' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300'
                    )} variant="outline">
                        {submission.status}
                    </Badge>
                </div>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'Vu')}><Eye className="mr-2 h-4 w-4 text-gray-500"/> Marquer comme vu</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'En cours')}><Briefcase className="mr-2 h-4 w-4 text-yellow-500"/> Mettre en cours</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'Terminé')}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Marquer comme terminé</DropdownMenuItem>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                <Trash2 className="mr-2 h-4 w-4"/> Supprimer
                            </div>
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
                </DropdownMenuContent>
            </DropdownMenu>
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
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    
    const isAdmin = user?.email === 'grasdvirus@gmail.com';

    const submissionsQuery = useMemoFirebase(
        () => {
            if (!firestore || !isAdmin) {
                return null;
            }
            return query(collection(firestore, 'submissions'), orderBy('createdAt', 'desc'));
        },
        [firestore, isAdmin]
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
    
    const handleStatusChange = async (id: string, status: ContractSubmission['status']) => {
        if (!firestore) return;
        const subRef = doc(firestore, 'submissions', id);
        try {
            await updateDoc(subRef, { status });
            toast({ variant: 'success', title: 'Statut mis à jour !'});
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
        }
    };
    
    if (!isAdmin) {
      return (
        <NeumorphicCard inset className="p-4 sm:p-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold font-headline mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">Vous n'avez pas les autorisations nécessaires pour voir cette section.</p>
        </NeumorphicCard>
      )
    }

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
                                <TableHead>Statut</TableHead>
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
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{submission.fullName}</span>
                                            {submission.companyName && <span className="text-xs text-muted-foreground">{submission.companyName}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <a href={`mailto:${submission.email}`} className="hover:underline text-primary text-xs">{submission.email}</a>
                                            <span className="text-xs text-muted-foreground">{submission.phone}</span>
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        <Badge className={cn(
                                            "capitalize",
                                            submission.status === 'Nouveau' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
                                            submission.status === 'Vu' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-400',
                                            submission.status === 'En cours' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
                                            submission.status === 'Terminé' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300'
                                        )} variant="outline">
                                            {submission.status}
                                        </Badge>
                                    </TableCell>
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
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">Gérer</Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'Vu')}><Eye className="mr-2 h-4 w-4 text-gray-500"/> Marquer comme vu</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'En cours')}><Briefcase className="mr-2 h-4 w-4 text-yellow-500"/> Mettre en cours</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'Terminé')}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Marquer comme terminé</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                                            <Trash2 className="mr-2 h-4 w-4"/> Supprimer
                                                        </div>
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
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="sm:hidden space-y-4">
                  {filteredSubmissions?.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} formatDate={formatDate} handleDelete={handleDelete} handleStatusChange={handleStatusChange} />
                  ))}
                </div>
                </>
            )}
            {(!isLoading) && filteredSubmissions?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? "Aucune demande ne correspond à votre recherche." : "Aucune demande pour le moment."}
                </p>
            )}
        </NeumorphicCard>
    );
}
