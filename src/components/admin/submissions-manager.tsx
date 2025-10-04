
'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { ContractSubmission } from '@/app/admin/page';
import { NeumorphicCard } from '../neumorphic-card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function SubmissionsManager() {
    const { firestore } = useFirebase();
    const submissionsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'submissions'), orderBy('createdAt', 'desc')) : null,
        [firestore]
    );
    const { data: submissions, isLoading } = useCollection<ContractSubmission>(submissionsQuery);

    const formatDate = (timestamp: ContractSubmission['createdAt'] | null) => {
        if (!timestamp) return 'Date inconnue';
        const date = new Date(timestamp.seconds * 1000);
        return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
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
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Téléphone</TableHead>
                                <TableHead>Entreprise</TableHead>
                                <TableHead>Projet</TableHead>
                                <TableHead>Détails</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions?.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell className="font-medium whitespace-nowrap">{formatDate(submission.createdAt)}</TableCell>
                                    <TableCell>{submission.fullName}</TableCell>
                                    <TableCell><a href={`mailto:${submission.email}`} className="hover:underline text-primary">{submission.email}</a></TableCell>
                                    <TableCell>{submission.phone}</TableCell>
                                    <TableCell>{submission.companyName || '-'}</TableCell>
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
