

'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { ContractSubmission } from '@/app/admin/page';
import { NeumorphicCard } from '../neumorphic-card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Minus, Plus, Link as LinkIcon, User, Mail, Phone, Code, Check, X, Clock, RefreshCw, BarChart, Trophy, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


function PartnerDetails({ partner }: { partner: ContractSubmission }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const handleUpdateUses = async (amount: number) => {
        if (!firestore) return;
        const partnerRef = doc(firestore, 'submissions', partner.id);
        const currentUses = partner.promoCodeUses || 0;
        if (currentUses + amount < 0) return;

        await updateDoc(partnerRef, {
            promoCodeUses: increment(amount),
            promoCodeTotalUses: increment(amount)
        });
        toast({ variant: "success", title: "Compteur mis à jour!" });
    };

    const handleResetUses = async () => {
        if (!firestore) return;
        const partnerRef = doc(firestore, 'submissions', partner.id);
        await updateDoc(partnerRef, {
            promoCodeUses: 0
        });
        toast({ variant: "success", title: "Compteur de récompense réinitialisé !" });
    };

    return (
        <NeumorphicCard inset className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><User />Coordonnées</h4>
                    <p className="text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {partner.email}</p>
                    <p className="text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {partner.phone}</p>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><LinkIcon />Réseaux Sociaux</h4>
                    {partner.socialLinks?.map((link, i) => (
                        <Link key={i} href={link} target="_blank" className="text-sm text-primary hover:underline block truncate">{link}</Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Reward Counter */}
                <div className="flex flex-col gap-4 rounded-lg p-3 neumorphic-card-light dark:neumorphic-card-dark">
                    <div className='text-center sm:text-left'>
                        <p className="font-semibold flex items-center gap-2 text-sm"><Trophy className="w-4 h-4" />Compteur pour Récompense</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => handleUpdateUses(-1)} disabled={(partner.promoCodeUses || 0) === 0} className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-10 text-center">{partner.promoCodeUses || 0}</span>
                        <Button size="icon" variant="outline" onClick={() => handleUpdateUses(1)} className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button onClick={handleResetUses} variant="outline" size="sm" className="self-center btn-neumorphic-light dark:btn-neumorphic-dark">
                        <RefreshCw className="h-3 w-3 mr-2" /> Réinitialiser
                    </Button>
                </div>
                {/* Total Uses Counter */}
                 <div className="flex flex-col justify-center items-center gap-2 rounded-lg p-3 neumorphic-card-light dark:neumorphic-card-dark">
                     <p className="font-semibold flex items-center gap-2 text-sm"><BarChart className="w-4 h-4" />Utilisations Totales (à vie)</p>
                     <p className="font-bold text-2xl text-primary">{partner.promoCodeTotalUses || 0}</p>
                </div>
            </div>
            
            <div className="text-center rounded-lg p-3 neumorphic-card-light dark:neumorphic-card-dark">
                <p className="font-semibold flex items-center justify-center gap-2"><Code className="w-4 h-4" />Code Promo</p>
                <p className="font-mono text-primary text-xl mt-1">{partner.promoCode}</p>
            </div>
        </NeumorphicCard>
    );
}

function PartnerRow({ partner, onDelete }: { partner: ContractSubmission, onDelete: (id: string) => void }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const handleStatusChange = async (id: string, status: 'en attente' | 'confirmé' | 'refusé') => {
        if (!firestore) return;
        const partnerRef = doc(firestore, 'submissions', id);
        try {
            await updateDoc(partnerRef, { status });
            toast({ variant: 'success', title: 'Statut mis à jour !'});
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
        }
    };

    return (
        <React.Fragment>
            <TableRow data-state={isOpen ? 'open' : 'closed'} className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <TableCell className="font-medium">{partner.fullName}</TableCell>
                <TableCell>{partner.email}</TableCell>
                <TableCell><span className="font-mono">{partner.promoCode}</span></TableCell>
                <TableCell>
                    <Badge className={cn(
                        "capitalize",
                        partner.status === 'confirmé' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300',
                        partner.status === 'en attente' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
                        partner.status === 'refusé' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300'
                    )} variant="outline">
                        {partner.status}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">Gérer</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleStatusChange(partner.id, 'confirmé')}>
                                    <Check className="mr-2 h-4 w-4 text-green-500"/> Confirmer
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(partner.id, 'refusé')}>
                                    <X className="mr-2 h-4 w-4 text-red-500"/> Refuser
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(partner.id, 'en attente')}>
                                    <Clock className="mr-2 h-4 w-4 text-yellow-500"/> Mettre en attente
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                             <Trash2 className="mr-2 h-4 w-4"/> Supprimer
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>Cette action est irréversible et supprimera définitivement ce partenaire.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(partner.id)}>Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </TableCell>
            </TableRow>
            {isOpen && (
                <TableRow>
                    <TableCell colSpan={5} className="p-0 bg-muted/50">
                        <div className="p-4">
                            <PartnerDetails partner={partner} />
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
}

function PartnerCard({ partner, onDelete }: { partner: ContractSubmission, onDelete: (id: string) => void }) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (id: string, status: 'en attente' | 'confirmé' | 'refusé') => {
      if (!firestore) return;
      const partnerRef = doc(firestore, 'submissions', id);
      try {
          await updateDoc(partnerRef, { status });
          toast({ variant: 'success', title: 'Statut mis à jour !'});
      } catch (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
      }
  };

  return (
    <NeumorphicCard className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">{partner.fullName}</h3>
          <p className="text-sm text-muted-foreground">{partner.email}</p>
          <div className="mt-2">
            <Badge className={cn(
                "capitalize",
                partner.status === 'confirmé' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300',
                partner.status === 'en attente' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
                partner.status === 'refusé' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300'
            )} variant="outline">
                {partner.status}
            </Badge>
          </div>
        </div>
        <div onClick={e => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange(partner.id, 'confirmé')}>
                        <Check className="mr-2 h-4 w-4 text-green-500"/> Confirmer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(partner.id, 'refusé')}>
                        <X className="mr-2 h-4 w-4 text-red-500"/> Refuser
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(partner.id, 'en attente')}>
                        <Clock className="mr-2 h-4 w-4 text-yellow-500"/> Mettre en attente
                    </DropdownMenuItem>
                     <DropdownMenuSeparator />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                <Trash2 className="mr-2 h-4 w-4"/> Supprimer
                            </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>Cette action est irréversible et supprimera définitivement ce partenaire.</AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(partner.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <p className="text-sm flex items-center gap-2"><Code className="w-4 h-4"/> <span className="font-mono">{partner.promoCode}</span></p>

      {isOpen && <PartnerDetails partner={partner} />}
      <Button variant="link" onClick={() => setIsOpen(!isOpen)} className="p-0 h-auto text-sm">
        {isOpen ? 'Masquer les détails' : 'Voir les détails'}
      </Button>
    </NeumorphicCard>
  )
}

export function PartnersManager({ searchTerm }: { searchTerm: string }) {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    
    const isAdmin = user?.email === 'grasdvirus@gmail.com';

    const partnersQuery = useMemoFirebase(() => {
        // **CRITICAL FIX**: Only create the query if the user is an admin.
        // For non-admins, this will be null, and useCollection will not run.
        if (!firestore || !isAdmin) {
            return null;
        }
        return query(collection(firestore, 'submissions'), where('type', '==', 'Partenariat'));
    }, [firestore, isAdmin]);

    const { data: partners, isLoading } = useCollection<ContractSubmission>(partnersQuery);
    
    const filteredPartners = useMemo(() => {
        if (!partners) return [];
        if (!searchTerm) return partners;

        return partners.filter(p =>
            p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.promoCode && p.promoCode.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [partners, searchTerm]);

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, "submissions", id));
            toast({ variant: 'success', title: 'Partenaire supprimé.'});
        } catch (error) {
            console.error("Error deleting partner: ", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le partenaire.'});
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
            <h2 className="text-xl sm:text-2xl font-bold font-headline mb-4">Demandes de Partenariat</h2>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : filteredPartners && filteredPartners.length > 0 ? (
                <>
                  <div className="hidden sm:block">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Nom</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Code Promo</TableHead>
                                  <TableHead>Statut</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                          {filteredPartners.map((partner) => (
                              <PartnerRow key={partner.id} partner={partner} onDelete={handleDelete} />
                          ))}
                          </TableBody>
                      </Table>
                  </div>
                  <div className="sm:hidden space-y-4">
                      {filteredPartners.map((partner) => (
                        <PartnerCard key={partner.id} partner={partner} onDelete={handleDelete} />
                      ))}
                  </div>
                </>
            ) : (
                <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? "Aucun partenaire ne correspond à votre recherche." : "Aucune demande de partenariat pour le moment."}
                </p>
            )}
        </NeumorphicCard>
    );
}
