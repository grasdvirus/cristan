
'use client';

import { useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { ContractSubmission } from '@/app/admin/page';
import { NeumorphicCard } from '../neumorphic-card';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Minus, Plus, Trash2, Link as LinkIcon, User, Mail, Phone, Code } from 'lucide-react';
import Link from 'next/link';

function PartnerDetails({ partner }: { partner: ContractSubmission }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const handleUpdateUses = async (amount: number) => {
        if (!firestore) return;
        const partnerRef = doc(firestore, 'submissions', partner.id);
        await updateDoc(partnerRef, {
            promoCodeUses: increment(amount)
        });
        toast({ variant: "success", title: "Compteur mis à jour!" });
    };

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'submissions', id));
            toast({ variant: 'success', title: 'Partenaire supprimé.' });
        } catch (error) {
            console.error('Error deleting partner', error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le partenaire.' });
        }
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg p-3 neumorphic-card-light dark:neumorphic-card-dark">
                <div className='text-center sm:text-left'>
                    <p className="font-semibold flex items-center gap-2"><Code className="w-4 h-4" />Code Promo: <span className="font-mono text-primary">{partner.promoCode}</span></p>
                    <p className="text-sm text-muted-foreground">Nombre d'utilisations: {partner.promoCodeUses || 0}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => handleUpdateUses(-1)} disabled={(partner.promoCodeUses || 0) === 0} className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg w-10 text-center">{partner.promoCodeUses || 0}</span>
                    <Button size="icon" variant="outline" onClick={() => handleUpdateUses(1)} className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogDescription>Cette action est irréversible et supprimera définitivement ce partenaire.</AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(partner.id)}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </NeumorphicCard>
    );
}

export function PartnersManager() {
    const { firestore } = useFirebase();
    const partnersQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'submissions'), where('type', '==', 'Partenariat')) : null,
        [firestore]
    );
    const { data: partners, isLoading } = useCollection<ContractSubmission>(partnersQuery);

    return (
        <NeumorphicCard inset className="p-6">
            <h2 className="text-2xl font-bold font-headline mb-4">Demandes de Partenariat</h2>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : partners && partners.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {partners.map((partner) => (
                        <AccordionItem value={partner.id} key={partner.id}>
                            <AccordionTrigger>
                                <div className="flex justify-between w-full pr-4">
                                    <span className="font-medium">{partner.fullName}</span>
                                    <span className="text-muted-foreground font-mono">{partner.promoCode}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <PartnerDetails partner={partner} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <p className="text-center text-muted-foreground py-8">Aucune demande de partenariat pour le moment.</p>
            )}
        </NeumorphicCard>
    );
}
