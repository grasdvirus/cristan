
'use client';

import { useRouter } from 'next/navigation';
import { NeumorphicCard } from '@/components/neumorphic-card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { BookOpen, HelpCircle, Zap, Handshake, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-0 sm:px-4 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                aria-label="Retour"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
        </div>

        <NeumorphicCard className="p-4 sm:p-6 md:p-8 relative">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold font-headline">À Propos de Cristan</h1>
            <p className="text-muted-foreground mt-2">
              Découvrez notre histoire, notre mission et comment nous fonctionnons.
            </p>
          </div>

          <div className="space-y-12">
            {/* Section Histoire */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold font-headline">Notre Histoire</h2>
              </div>
              <NeumorphicCard inset className="p-4 sm:p-6">
                <p className="text-muted-foreground leading-relaxed">
                  Cristan est né de la passion pour le design épuré et la technologie performante. Notre mission est de fournir des solutions web esthétiques et fonctionnelles qui se démarquent par leur simplicité et leur élégance. Nous avons commencé comme un petit projet explorant le neumorphisme et avons évolué vers une plateforme complète offrant des sites vitrines, des applications e-commerce et des portfolios pour créatifs, le tout avec une identité visuelle unique.
                </p>
              </NeumorphicCard>
            </section>

            <Separator />

            {/* Section Comment ça marche */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <Zap className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold font-headline">Comment ça marche ?</h2>
              </div>
              <NeumorphicCard inset className="p-4 sm:p-6">
                <p className="text-muted-foreground leading-relaxed">
                  Notre processus est simple et transparent. Parcourez nos modèles de projets, choisissez celui qui correspond à vos besoins, puis remplissez le formulaire de commande. Notre équipe vous contactera pour affiner les détails et lancer la production. Nous vous tenons informé à chaque étape, de la conception au déploiement, pour garantir que le produit final dépasse vos attentes.
                </p>
              </NeumorphicCard>
            </section>

            <Separator />

            {/* Section Partenariat */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <Handshake className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold font-headline">Devenir Partenaire</h2>
              </div>
              <NeumorphicCard inset className="p-4 sm:p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                      Rejoignez notre programme de partenariat pour bénéficier d'avantages exclusifs et collaborer avec nous. Voici comment procéder :
                  </p>
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                      <li>
                          <span className="font-semibold text-foreground">Accédez à la section Partenariat :</span> Depuis la page d'accueil, cliquez sur l'onglet "Partenariat" pour commencer.
                      </li>
                      <li>
                          <span className="font-semibold text-foreground">Entrez le code d'accès :</span> Pour accéder au formulaire, vous devrez entrer le code d'accès partenaire. Le code est <span className="font-mono text-primary p-1 rounded-md bg-muted">CRISTAN-PAT</span>.
                      </li>
                      <li>
                          <span className="font-semibold text-foreground">Remplissez le formulaire :</span> Fournissez vos informations, vos liens vers les réseaux sociaux et le code promotionnel que vous aimeriez utiliser.
                      </li>
                      <li>
                          <span className="font-semibold text-foreground">Attendez la confirmation :</span> Notre équipe examinera votre demande. Une fois approuvée, vous aurez accès à votre tableau de bord partenaire pour suivre les utilisations de votre code et vos récompenses.
                      </li>
                  </ol>
              </NeumorphicCard>
            </section>

            <Separator />

            {/* Section FAQ */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                  <HelpCircle className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold font-headline">Questions Fréquemment Posées</h2>
              </div>
              <NeumorphicCard inset className="p-4 sm:p-6">
                  <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left font-semibold">Quels sont les délais de livraison ?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                      Le délai de livraison varie en fonction de la complexité du projet. En général, un site vitrine prend entre 2 et 4 semaines, tandis qu'une application e-commerce peut prendre de 4 à 8 semaines. Nous vous fournirons une estimation précise lors de notre premier contact.
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left font-semibold">Proposez-vous des services de maintenance ?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                      Oui, nous proposons des forfaits de maintenance pour assurer que votre site reste à jour, sécurisé et performant. Ces forfaits incluent les mises à jour logicielles, les sauvegardes et un support technique de base.
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left font-semibold">Puis-je modifier mon site moi-même après la livraison ?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                      Absolument. Pour les projets qui le nécessitent, nous pouvons intégrer un système de gestion de contenu (CMS) simple qui vous permettra de mettre à jour le texte, les images et d'autres contenus sans avoir besoin de connaissances techniques.
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                      <AccordionTrigger className="text-left font-semibold">Quelles sont les options de paiement ?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                      Nous acceptons les virements bancaires ainsi que les paiements mobiles. Un acompte de 50% est généralement demandé pour commencer le projet, le solde étant dû à la livraison.
                      </AccordionContent>
                  </AccordionItem>
                  </Accordion>
              </NeumorphicCard>
            </section>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}
