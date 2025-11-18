
'use client';

import { useState, useMemo } from 'react';
import { doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trophy, TrendingUp, Copy, Plus, Minus, Edit2, Trash2, Link as LinkIcon, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

import type { ContractSubmission } from '@/app/admin/page';

interface PartnersManagerProps {
  submissions?: ContractSubmission[];
  isLoading?: boolean;
  searchTerm?: string;
}

export function PartnersManager({ submissions, isLoading, searchTerm = '' }: PartnersManagerProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [incrementDialogOpen, setIncrementDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<ContractSubmission | null>(null);
  const [incrementAmount, setIncrementAmount] = useState<number>(1);
  const [editCodeDialogOpen, setEditCodeDialogOpen] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');

  // Filtrer seulement les partenaires
  const partners = useMemo(() => {
    if (!submissions) return [];
    
    return submissions
      .filter((sub) => sub.type === 'Partenariat')
      .filter((partner) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          partner.fullName?.toLowerCase().includes(search) ||
          partner.email?.toLowerCase().includes(search) ||
          partner.promoCode?.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        // Trier par statut (confirmé en premier) puis par date
        if (a.status === 'confirmé' && b.status !== 'confirmé') return -1;
        if (a.status !== 'confirmé' && b.status === 'confirmé') return 1;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
  }, [submissions, searchTerm]);

  // Statistiques
  const stats = useMemo(() => {
    if (!partners) return { total: 0, confirmed: 0, pending: 0, totalUses: 0 };
    const confirmed = partners.filter(p => p.status === 'confirmé');
    const pending = partners.filter(p => p.status === 'en attente');
    const totalUses = confirmed.reduce((sum, p) => sum + (p.promoCodeTotalUses || 0), 0);
    
    return {
      total: partners.length,
      confirmed: confirmed.length,
      pending: pending.length,
      totalUses,
    };
  }, [partners]);

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


  // 🔥 ACTION 1 : Approuver un partenaire
  const handleApprove = async (partnerId: string) => {
    if (!firestore) return;
    setProcessingId(partnerId);

    try {
      const partnerRef = doc(firestore, 'submissions', partnerId);
      await updateDoc(partnerRef, {
        status: 'confirmé',
      });

      toast({
        variant: 'success',
        title: '✅ Partenaire approuvé !',
        description: 'Le partenaire peut maintenant accéder à son dashboard.',
      });
    } catch (error) {
      console.error('Error approving partner:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'approuver le partenaire.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // 🔥 ACTION 2 : Refuser un partenaire
  const handleReject = async (partnerId: string) => {
    if (!firestore) return;
    setProcessingId(partnerId);

    try {
      const partnerRef = doc(firestore, 'submissions', partnerId);
      await updateDoc(partnerRef, {
        status: 'refusé',
      });

      toast({
        variant: 'success',
        title: '❌ Partenaire refusé',
        description: 'Le statut a été mis à jour.',
      });
    } catch (error) {
      console.error('Error rejecting partner:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de refuser le partenaire.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // 🔥 ACTION 3 : Incrémenter les utilisations du code promo
  const handleIncrementUses = async () => {
    if (!firestore || !selectedPartner) return;
    setProcessingId(selectedPartner.id);

    try {
      const partnerRef = doc(firestore, 'submissions', selectedPartner.id);
      
      // Incrémenter les deux compteurs
      await updateDoc(partnerRef, {
        promoCodeUses: increment(incrementAmount),
        promoCodeTotalUses: increment(incrementAmount),
      });

      toast({
        variant: 'success',
        title: `🎉 +${incrementAmount} utilisation(s) !`,
        description: `Le compteur de ${selectedPartner.fullName} a été mis à jour.`,
      });

      setIncrementDialogOpen(false);
      setIncrementAmount(1);
      setSelectedPartner(null);
    } catch (error) {
      console.error('Error incrementing uses:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le compteur.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // 🔥 ACTION 4 : Réinitialiser le compteur (cycle de récompense)
  const handleResetUses = async (partnerId: string) => {
    if (!firestore) return;
    setProcessingId(partnerId);

    try {
      const partnerRef = doc(firestore, 'submissions', partnerId);
      await updateDoc(partnerRef, {
        promoCodeUses: 0,
      });

      toast({
        variant: 'success',
        title: '🔄 Compteur réinitialisé',
        description: 'Le cycle de récompense a été remis à zéro.',
      });
    } catch (error) {
      console.error('Error resetting uses:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de réinitialiser le compteur.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // 🔥 ACTION 5 : Modifier le code promo
  const handleEditPromoCode = async () => {
    if (!firestore || !selectedPartner || !newPromoCode.trim()) return;
    setProcessingId(selectedPartner.id);

    try {
      const partnerRef = doc(firestore, 'submissions', selectedPartner.id);
      await updateDoc(partnerRef, {
        promoCode: newPromoCode.trim(),
      });

      toast({
        variant: 'success',
        title: '✏️ Code promo modifié',
        description: `Nouveau code : ${newPromoCode}`,
      });

      setEditCodeDialogOpen(false);
      setNewPromoCode('');
      setSelectedPartner(null);
    } catch (error) {
      console.error('Error editing promo code:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier le code promo.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ variant: 'success', title: '📋 Code copié !' });
  };

  const formatDate = (timestamp?: { seconds: number }) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp.seconds * 1000), 'dd MMM yyyy', { locale: fr });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmé':
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">Actif</Badge>;
      case 'en attente':
        return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">En attente</Badge>;
      case 'refusé':
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-300">Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <NeumorphicCard inset className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-headline mb-4">Gestion des Partenaires</h2>
        
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.confirmed}</div>
            <div className="text-sm text-muted-foreground">Actifs</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">En attente</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalUses}</div>
            <div className="text-sm text-muted-foreground">Total utilisations</div>
          </div>
        </div>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Aucun partenaire trouvé.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Réseaux</TableHead>
                <TableHead>Code Promo</TableHead>
                <TableHead className="text-center">Cycle</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.fullName}</TableCell>
                  <TableCell>
                      <div className="flex flex-col gap-1">
                          <a href={`mailto:${partner.email}`} className="text-xs text-primary hover:underline">{partner.email}</a>
                          {partner.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3"/> {partner.phone}</span>}
                      </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {partner.socialLinks?.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3 h-3"/> Lien {i + 1}
                          </a>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {partner.promoCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyCode(partner.promoCode || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setSelectedPartner(partner);
                          setNewPromoCode(partner.promoCode || '');
                          setEditCodeDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold">{partner.promoCodeUses || 0}</span>
                    <span className="text-muted-foreground text-sm"> / 100</span>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {partner.promoCodeTotalUses || 0}
                  </TableCell>
                  <TableCell>{getStatusBadge(partner.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(partner.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {partner.status === 'en attente' && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700"
                                disabled={processingId === partner.id}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approuver ce partenaire ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {partner.fullName} pourra accéder à son tableau de bord et commencer à utiliser son code promo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApprove(partner.id)}>
                                  Approuver
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                disabled={processingId === partner.id}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Refuser ce partenaire ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action changera le statut à "refusé".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleReject(partner.id)}>
                                  Refuser
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}

                      {partner.status === 'confirmé' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => {
                              setSelectedPartner(partner);
                              setIncrementDialogOpen(true);
                            }}
                            disabled={processingId === partner.id}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-orange-600"
                                disabled={processingId === partner.id || (partner.promoCodeUses || 0) === 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Réinitialiser le compteur ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Le compteur du cycle actuel sera remis à 0. Le total à vie ne sera pas affecté.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleResetUses(partner.id)}>
                                  Réinitialiser
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                disabled={processingId === partner.id}
                                >
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce partenaire ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Cette action est irréversible. Toutes les données associées seront perdues.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(partner.id)}>
                                Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog pour incrémenter les utilisations */}
      <Dialog open={incrementDialogOpen} onOpenChange={setIncrementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter des utilisations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Partenaire</Label>
              <p className="text-sm font-medium">{selectedPartner?.fullName}</p>
              <p className="text-xs text-muted-foreground">Code: {selectedPartner?.promoCode}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="increment-amount">Nombre d'utilisations à ajouter</Label>
              <Input
                id="increment-amount"
                type="number"
                min="1"
                value={incrementAmount}
                onChange={(e) => setIncrementAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"
              />
            </div>
            <div className="bg-muted rounded-lg p-3 text-sm">
              <div className="flex justify-between mb-1">
                <span>Cycle actuel :</span>
                <span className="font-medium">{selectedPartner?.promoCodeUses || 0} → {(selectedPartner?.promoCodeUses || 0) + incrementAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total à vie :</span>
                <span className="font-medium">{selectedPartner?.promoCodeTotalUses || 0} → {(selectedPartner?.promoCodeTotalUses || 0) + incrementAmount}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIncrementDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleIncrementUses} disabled={processingId === selectedPartner?.id}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier le code promo */}
      <Dialog open={editCodeDialogOpen} onOpenChange={setEditCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le code promo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Partenaire</Label>
              <p className="text-sm font-medium">{selectedPartner?.fullName}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-promo-code">Nouveau code promo</Label>
              <Input
                id="new-promo-code"
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                placeholder="NOUVEAU-CODE"
                maxLength={15}
                className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCodeDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditPromoCode} disabled={!newPromoCode.trim() || processingId === selectedPartner?.id}>
              <Edit2 className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NeumorphicCard>
  );
}
