
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Info, HelpCircle } from 'lucide-react';
import type { AboutContent } from '@/lib/about';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function fetchAboutContentClient(): Promise<AboutContent> {
    const aboutDocRef = doc(db, 'config', 'about');
    const docSnap = await getDoc(aboutDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as AboutContent;
    }
    // Return default structure if it doesn't exist
    return {
        history: "L'histoire de notre site est en cours d'écriture. Revenez bientôt !",
        howItWorks: "Les détails sur le fonctionnement de notre plateforme seront bientôt disponibles.",
        faqs: [{ id: '1', question: 'Quand les informations seront-elles disponibles ?', answer: 'Nous travaillons activement pour mettre à jour cette page. Merci de votre patience.' }]
    };
}


export default function AboutPage() {
    const [content, setContent] = useState<AboutContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchAboutContentClient()
            .then(data => setContent(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!content) {
         return (
            <div className="flex h-96 w-full items-center justify-center text-red-500">
                Erreur de chargement du contenu.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-headline text-primary">À Propos de Cristan</h1>
                <p className="mt-2 text-lg text-muted-foreground">Tout ce que vous devez savoir sur notre plateforme.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Info className="h-6 w-6 text-primary" />
                        Notre Histoire
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-foreground/90 whitespace-pre-wrap">
                    <p>{content.history}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Info className="h-6 w-6 text-primary" />
                        Comment ça marche ?
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-foreground/90 whitespace-pre-wrap">
                    <p>{content.howItWorks}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <HelpCircle className="h-6 w-6 text-primary" />
                        Foire Aux Questions (FAQ)
                    </CardTitle>
                     <CardDescription>
                        Trouvez ici les réponses à vos questions les plus fréquentes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {content.faqs && content.faqs.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {content.faqs.map((faq, index) => (
                                <AccordionItem key={faq.id} value={`item-${index}`}>
                                    <AccordionTrigger className="text-lg text-left hover:no-underline">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground whitespace-pre-wrap">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Aucune question pour le moment.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
