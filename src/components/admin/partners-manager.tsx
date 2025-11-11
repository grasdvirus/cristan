
'use client';

import { useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, increment } from 'firebase/firestore';
import { ContractSubmission } from '@/app/admin/page';
import { NeumorphicCard } from '../neumorphic-card';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Minus, Plus, Link as LinkIcon, User, Mail, Phone, Code, Check, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

function PartnerDetails({ partner }: { partner: ContractSubmission }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const handleUpdateUses = async (amount: number) => {
        if (!firestore) return;
        const partnerRef = doc(firestore, 'submissions', partner.id);
        const currentUses = partner.promoCodeUses || 0;
        if (currentUses + amount < 0) return;

        await updateDoc(partnerRef, {
            promoCodeUses: increment(amount)
        });
        toast({ variant: "success", title: "Compteur mis à jour!" });
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
        </NeumorphicCard>
    );
}

const statusColors = {
    "en attente": "bg-yellow-500",
    "confirmé": "bg-green-500",
    "refusé": "bg-red-500",
};

const statusIcons = {
    "en attente": <Clock className="h-4 w-4" />,
    "confirmé": <Check className="h-4 w-4" />,
    "refusé": <X className="h-4 w-4" />,
};

export function PartnersManager() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const partnersQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'submissions'), where('type', '==', 'Partenariat')) : null,
        [firestore]
    );
    const { data: partners, isLoading } = useCollection<ContractSubmission>(partnersQuery);
    
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
        <NeumorphicCard inset className="p-6">
            <h2 className="text-2xl font-bold font-headline mb-4">Demandes de Partenariat</h2>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : partners && partners.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Code Promo Suggéré</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {partners.map((partner) => (
                            <Accordion key={partner.id} type="single" collapsible asChild>
                                <AccordionItem value={partner.id} asChild>
                                    <>
                                    <TableRow className="w-full">
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
                                        <TableCell className="text-right flex items-center justify-end gap-2">
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
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AccordionTrigger className="p-2 hover:bg-accent rounded-md [&[data-state=open]>svg]:rotate-90">
                                                <span className="sr-only">Voir les détails</span>
                                            </AccordionTrigger>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-0">
                                            <AccordionContent>
                                                <PartnerDetails partner={partner} />
                                            </AccordionContent>
                                        </TableCell>
                                    </TableRow>
                                    </>
                                </AccordionItem>
                            </Accordion>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-8">Aucune demande de partenariat pour le moment.</p>
            )}
        </NeumorphicCard>
    );
}
