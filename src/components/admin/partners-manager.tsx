
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
import { CheckCircle, XCircle, Trophy, TrendingUp, Copy, Plus, Minus, Edit2, Trash2, Phone, Facebook, Instagram, Linkedin, Twitter, Youtube, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { ContractSubmission } from '@/app/admin/page';

type SocialLink = {
    platform: string;
    username: string;
};

type PartnerSubmission = Omit<ContractSubmission, 'socialLinks'> & {
    socialLinks?: SocialLink[];
};

interface PartnersManagerProps {
  submissions?: ContractSubmission[];
  isLoading?: boolean;
  searchTerm?: string;
}

const SnapchatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}><title>Snapchat</title><path d="M11.957 8.705c-.172.03-.34.08-.495.14-.316.12-.553.31-.69.54-.158.26-.208.56-.168.85.03.22.132.42.29.58.157.16.355.27.575.32.22.05.45.03.66-.05.336-.12.574-.31.71-.54.158-.26.208-.56.168-.85a.86.86 0 00-.288-.58.937.937 0 00-.573-.32.964.964 0 00-.279-.01zm.02 1.54c-.06.01-.12.01-.17.01-.06 0-.13 0-.19-.01a.34.34 0 01-.3-.3c0-.1.02-.2.07-.3.05-.09.11-.17.19-.22.08-.05.16-.08.25-.08.09 0 .18.02.26.06.16.08.28.23.3.4.03.17-.03.35-.16.46-.03.03-.07.05-.11.07-.01 0-.02.01-.04.01zM23.33 0c.34 0 .67.33.67.67v22.66c0 .34-.33.67-.67.67H.67C.33 24 0 23.67 0 23.33V.67C0 .33.33 0 .67 0h22.66m-1.74 4.88c-.28-.15-.7-.1-1.07.18-.32.25-.56.55-.75.88-.34.58-.6 1.22-.76 1.88l-1.63.14c0-.02-.01-.03-.01-.05a5.55 5.55 0 00-1.42-3.87c-.57-.6-1.28-1.04-2.06-1.32-.42-.15-.86-.22-1.3-.23a5.2 5.2 0 00-4.3 1.95c-.49.6-.82 1.34-1 2.13-.17.76-.23 1.55-.16 2.33.08.82.32 1.63.7 2.37.08.15.17.3.27.44.2.3.43.58.68.83.45.45 1 .8 1.6 1.05.53.22 1.1.33 1.67.33.82 0 1.62-.2 2.35-.55.6-.28 1.15-.68 1.6-1.16.5-.53.88-1.15 1.1-1.82.1-.3.17-.62.22-.94l.03-.23 1.7-.12c0 .01 0 .03.01.04.03.2.06.4.08.6.13 1.1.5 2.17 1.08 3.16.2.33.45.63.75.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.1-.3-.26-.58-.45-.83-.45-.6-1-1.1-1.5-1.6-.3-.3-.58-.6-.82-.93-.15-.22-.27-.45-.37-.7-.1-.24-.18-.48-.24-.73-.1-.4-.17-.8-.2-1.2l-.03-.3 1.7-.12c.16.6.4 1.18.72 1.7.2.33.45.63.75.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.1-.3-.26-.58-.45-.83-.45-.6-1-1.1-1.5-1.6-.2-.2-.3-.3-.3-.3v-.02c-.02-.02-.03-.04-.05-.06a4.01 4.01 0 00-.7-2.1c-.08-.18-.18-.35-.28-.52-.3-.5-.68-.94-1.1-1.32-.4-.36-.85-.65-1.34-.85-.52-.2-1.07-.3-1.63-.3-.42 0-.82.06-1.2.18-.38.12-.73.28-1.05.5-.6.4-1.1 1-1.48 1.66-.2.34-.36.7-.48 1.07-.12.38-.2.77-.25 1.16-.05.4-.07.8-.04 1.2l1.62.14c-.03-.2-.04-.4-.02-.6.03-.4.12-.8.27-1.16.15-.38.35-.73.6-1.05.25-.3.53-.56.84-.78.3-.22.63-.4.98-.52.3-.1.6-.15.9-.15.42 0 .82.06 1.2.18.38.12.73.28 1.05.5.6.4 1.1 1 1.48 1.66.2.34.36.7.48 1.07.12.38.2.77.25 1.16.05.4.07.8.04 1.2l-1.6.14c.06.4.15.8.27 1.17.12.36.28.7.48 1.02.2.3.4.58.67.82.26.24.55.45.85.6.3.17.62.3.94.38.3.08.6.12.9.12.55 0 1.1-.12 1.6-.33.5-.22.96-.52 1.36-.88.4-.36.75-.8 1.02-1.28.28-.5.48-1.02.6-1.55l-.02-.02 1.7-.1c.14.53.33 1.05.58 1.55.2.4.45.75.75.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.04-.15-.1-.3-.18-.44-.2-.33-.45-.63-.75-.88-.34-.3-.7-.56-1.1-.76-.37-.18-.76-.3-1.15-.38-.4-.08-.8-.12-1.2-.12-.7 0-1.38.13-2.02.4-.6.25-1.15.6-1.62 1.04-.5.45-.9 1-.12 1.55-.18.38-.3.78-.4 1.18-.1.4-.15.8-.18 1.2l-.02.2 1.7.12c0-.02.01-.03.01-.05.03-.2.06-.4.08-.6.13-1.1.5-2.17 1.08 3.16.2.33.45.63.75-.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.1-.3-.26-.58-.45-.83-.45-.6-1-1.1-1.5-1.6-.2-.2-.3-.3-.3-.3s0-.02-.02-.02a4.01 4.01 0 00-.7-2.1c-.08-.18-.18-.35-.28-.52-.3-.5-.68-.94-1.1-1.32-.4-.36-.85-.65-1.34-.85-.52-.2-1.07-.3-1.63-.3-.42 0-.82.06-1.2.18-.38.12-.73.28-1.05.5-.6.4-1.1 1-1.48 1.66-.2.34-.36.7-.48 1.07-.12.38-.2.77-.25 1.16-.05.4-.07.8-.04 1.2l1.62.14c-.03-.2-.04-.4-.02-.6.03-.4.12-.8.27-1.16.15-.38.35-.73.6-1.05.25-.3.53-.56.84-.78.3-.22.63-.4.98-.52.3-.1.6-.15.9-.15.42 0 .82.06 1.2.18.38.12.73.28 1.05.5.6.4 1.1 1 1.48 1.66.2.34.36.7.48 1.07.12.38.2.77.25 1.16.05.4.07.8.04 1.2l-1.6.14c.06.4.15.8.27 1.17.12.36.28.7.48 1.02.2.3.4.58.67.82.26.24.55.45.85.6.3.17.62.3.94.38.3.08.6.12.9.12.55 0 1.1-.12 1.6-.33.5-.22.96-.52 1.36-.88.4-.36.75-.8 1.02-1.28.28-.5.48-1.02.6-1.55l-.02-.02 1.7-.1c.14.53.33 1.05.58 1.55.2.4.45.75.75.88.2.17.43.26.68.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.04-.15-.1-.3-.18-.44-.2-.33-.45-.63-.75-.88-.34-.3-.7-.56-1.1-.76-.37-.18-.76-.3-1.15-.38-.4-.08-.8-.12-1.2-.12-.7 0-1.38.13-2.02.4-.6.25-1.15.6-1.62 1.04-.5.45-.9 1-.12 1.55-.18.38-.3.78-.4 1.18-.1.4-.15.8-.18 1.2l-.02.2 1.7.12c0-.02.01-.03.01-.05a5.48 5.48 0 001.17-6.35c.2-.33.45-.63.75-.88.2-.17.43-.26.68-.26.17 0 .34-.04.5-.12.42-.2.64-.67.5-1.12-.05-.16-.1-.3-.18-.45z"/></svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}><title>TikTok</title><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.86-.95-6.69-2.81-1.77-1.8-2.55-4.16-2.3-6.61.22-2.13 1.31-4.24 3.1-5.51 1.03-.71 2.22-1.1 3.49-1.16.02 2.84-.01 5.66.02 8.51.01.12.01.23.05.34.07.24.2.45.38.61.16.18.35.32.56.41.28.13.6.19.92.19.64 0 1.25-.22 1.75-.58.55-.38.9-1.01.9-1.68 0-.25-.03-.5-.08-.75l-.01-5.78z"/></svg>
);

const socialPlatforms: Record<string, { icon: React.FC<any>, baseUrl: string }> = {
  instagram: { icon: Instagram, baseUrl: 'https://instagram.com/' },
  facebook: { icon: Facebook, baseUrl: 'https://facebook.com/' },
  linkedin: { icon: Linkedin, baseUrl: 'https://linkedin.com/in/' },
  twitter: { icon: Twitter, baseUrl: 'https://twitter.com/' },
  youtube: { icon: Youtube, baseUrl: 'https://youtube.com/' },
  tiktok: { icon: TikTokIcon, baseUrl: 'https://tiktok.com/@' },
  snapchat: { icon: SnapchatIcon, baseUrl: 'https://snapchat.com/add/' },
  website: { icon: Globe, baseUrl: '' },
};

export function PartnersManager({ submissions, isLoading, searchTerm = '' }: PartnersManagerProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [incrementDialogOpen, setIncrementDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerSubmission | null>(null);
  const [incrementAmount, setIncrementAmount] = useState<number>(1);
  const [editCodeDialogOpen, setEditCodeDialogOpen] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');

  // Filtrer seulement les partenaires
  const partners = useMemo(() => {
    if (!submissions) return [];
    
    return (submissions.filter((sub) => sub.type === 'Partenariat') as PartnerSubmission[])
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
                    <div className="flex items-center gap-2">
                      {partner.socialLinks?.map((link, i) => {
                          const platform = socialPlatforms[link.platform as keyof typeof socialPlatforms];
                          if (!platform) return null;
                          const Icon = platform.icon;
                          const url = platform.baseUrl ? `${platform.baseUrl}${link.username}` : link.username;
                          return (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" title={`${link.platform}: ${link.username}`}>
                               <Icon className="w-4 h-4 text-muted-foreground hover:text-primary"/>
                            </a>
                          )
                      })}
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
               <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIncrementAmount(prev => Math.max(1, prev - 1))}>
                        <Minus className="h-4 w-4"/>
                    </Button>
                    <Input
                        id="increment-amount"
                        type="number"
                        min="1"
                        readOnly
                        value={incrementAmount}
                        className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark text-center font-bold"
                    />
                     <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIncrementAmount(prev => prev + 1)}>
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
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
