'use client';

import { useState, useMemo } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trash2, MoreVertical, Briefcase, Eye, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { RewardRequest } from '@/app/admin/page';

interface RewardRequestsManagerProps {
  requests?: RewardRequest[];
  isLoading?: boolean;
  searchTerm?: string;
}

export function RewardRequestsManager({ requests, isLoading, searchTerm = '' }: RewardRequestsManagerProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    
    return requests
      .filter((req) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          req.userName?.toLowerCase().includes(search) ||
          req.promoCode?.toLowerCase().includes(search) ||
          req.paymentDetails?.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [requests, searchTerm]);

  const handleStatusChange = async (requestId: string, status: 'traitée' | 'refusée') => {
    if (!firestore) return;

    try {
      const requestRef = doc(firestore, 'rewardRequests', requestId);
      await updateDoc(requestRef, { status });
      toast({
        variant: 'success',
        title: 'Statut mis à jour !',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, "rewardRequests", id));
        toast({ variant: 'success', title: 'Demande supprimée.'});
    } catch (error) {
        console.error("Error deleting request: ", error);
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la demande.'});
    }
  };

  const formatDate = (timestamp?: { seconds: number }) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp.seconds * 1000), 'dd MMM yyyy, HH:mm', { locale: fr });
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getStatusBadge = (status: RewardRequest['status']) => {
    return (
      <Badge className={cn(
          "capitalize",
          status === 'en attente' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
          status === 'traitée' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300',
          status === 'refusée' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300'
      )} variant="outline">
          {status}
      </Badge>
    );
  };
  
  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <NeumorphicCard inset className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-headline mb-4">Demandes de Récompenses</h2>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Gift className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Aucune demande de récompense pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Partenaire</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium whitespace-nowrap">{formatDate(req.createdAt)}</TableCell>
                  <TableCell>
                    <div>{req.userName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{req.promoCode}</div>
                  </TableCell>
                   <TableCell className="font-semibold">{formatAmount(req.amount)}</TableCell>
                  <TableCell>
                    <div className="capitalize">{req.paymentMethod.replace('_', ' ')}</div>
                    <div className="text-xs text-muted-foreground">{req.paymentDetails}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    {req.status === 'en attente' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">Gérer</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'traitée')}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Marquer comme traitée
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'refusée')}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-500"/> Refuser la demande
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                            <Trash2 className="mr-2 h-4 w-4"/> Supprimer
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(req.id)}>Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {req.status !== 'en attente' && (
                       <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(req.id)}>Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </NeumorphicCard>
  );
}
