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
import { BookOpen, HelpCircle, Zap, Handshake, ArrowLeft, Bot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Chatbot } from '@/components/chatbot';

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
                      Rejoignez notre programme pour obtenir un code promo unique, suivre vos performances et gagner des récompenses. Voici les étapes à suivre :
                  </p>
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                      <li>
                          <span className="font-semibold text-foreground">Créez votre compte :</span> La première étape est de vous <Link href="/login" className='text-primary underline'>connecter ou créer un compte</Link> sur notre site. C'est essentiel pour associer votre partenariat à votre profil.
                      </li>
                      <li>
                          <span className="font-semibold text-foreground">Accédez à l'espace partenaire :</span> Une fois connecté, allez dans la section "Partenariat" <Link href="/partner/register" className='text-primary underline'>en cliquant ici</Link> ou via l'onglet sur la page d'accueil.
                      </li>
                      <li>
                          <span className="font-semibold text-foreground">Entrez le code d'accès :</span> Pour accéder au formulaire, vous devrez entrer le code d'accès partenaire : <span className="font-mono text-primary p-1 rounded-md bg-muted">CRISTAN-PAT</span>.
                      </li>
                      <li>
                          <span className="font-semibold text-foreground">Remplissez le formulaire :</span> Fournissez vos informations, vos liens vers les réseaux sociaux et le code promotionnel personnalisé que vous souhaitez proposer à votre audience.
                      </li>
                      <li>
                          <span className="font-semibold text-foreground">Attendez la confirmation :</span> Notre équipe examinera votre demande. Une fois votre statut "confirmé", vous aurez accès à votre tableau de bord partenaire pour suivre les utilisations de votre code et vos récompenses en temps réel.
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
                      <AccordionTrigger className="text-left font-semibold">Comment commander un projet ?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                      C'est très simple ! Allez sur la page <Link href="/internet" className="text-primary underline">"Internet"</Link>, choisissez un modèle qui vous plaît, puis cliquez sur le bouton "Plus" pour voir les détails. Sur la page du projet, cliquez sur "Commander" pour accéder au formulaire. Remplissez-le, et nous vous contacterons rapidement.
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left font-semibold">Quelle est la différence entre un projet standard et un projet sur mesure ?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                      Les projets standards sont basés sur nos modèles prédéfinis, ce qui permet un développement plus rapide et un coût maîtrisé. Un <Link href="/custom-project" className="text-primary underline">projet sur mesure</Link> est créé de A à Z selon vos spécifications uniques, offrant une flexibilité totale en termes de design et de fonctionnalités.
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left font-semibold">Comment fonctionne le programme de partenariat ?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                      Après avoir créé un compte, vous pouvez postuler au programme partenaire via la section dédiée. Une fois approuvé, vous recevez un code promo personnalisé. Chaque fois que quelqu'un utilise votre code pour un achat, vous gagnez une commission et progressez vers des récompenses. Vous pouvez suivre toutes vos statistiques sur votre tableau de bord.
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                      <AccordionTrigger className="text-left font-semibold">Que se passe-t-il après avoir soumis une demande de projet ?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                      Une fois que vous avez rempli et soumis un formulaire de contact ou de commande, notre équipe reçoit une notification. Nous vous contacterons par e-mail ou téléphone dans les plus brefs délais (généralement moins de 10 minutes) pour discuter de votre projet, clarifier les détails et vous expliquer les prochaines étapes.
                      </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-5">
                      <AccordionTrigger className="text-left font-semibold">Quelles sont les options de paiement ?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                      Nous acceptons les virements bancaires ainsi que les paiements mobiles (Orange Money, Wave, etc.). Un acompte de 50% est généralement demandé pour commencer le projet, le solde étant dû à la livraison.
                      </AccordionContent>
                  </AccordionItem>
                  </Accordion>
              </NeumorphicCard>
            </section>

            <Separator />
            
            {/* Section Chatbot */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <Bot className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold font-headline">Assistant Virtuel</h2>
              </div>
              <Chatbot />
            </section>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}
