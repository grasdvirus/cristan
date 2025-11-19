
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Building, FileText, Globe, Mail, Phone, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="container mx-auto px-0 sm:px-4 py-16 sm:py-24">
      <NeumorphicCard className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 relative">
        <div className="relative text-center mb-12">
            <Button 
                asChild
                variant="ghost" 
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full btn-neumorphic-light dark:btn-neumorphic-dark"
                aria-label="Retour"
            >
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
          <h1 className="text-3xl sm:text-4xl font-bold font-headline">Mentions Légales</h1>
          <p className="text-muted-foreground mt-2">
            Informations légales concernant le site Cristan.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section Éditeur du site */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold font-headline">Éditeur du Site</h2>
            </div>
            <NeumorphicCard inset className="p-4 sm:p-6 space-y-3">
              <p className="flex items-center gap-3"><UserCircle className="w-5 h-5 text-muted-foreground"/> <strong>Nom :</strong> Cristan</p>
              <p className="flex items-center gap-3"><Building className="w-5 h-5 text-muted-foreground"/> <strong>Adresse :</strong> Côte d'Ivoire, Abidjan, Cocody Angré</p>
              <p className="flex items-center gap-3"><Phone className="w-5 h-5 text-muted-foreground"/> <strong>Contact :</strong> 07 04 54 29 09</p>
              <p className="flex items-center gap-3"><Mail className="w-5 h-5 text-muted-foreground"/> <strong>E-mail :</strong> kingstartup2@gmail.com</p>
              <p className="flex items-center gap-3"><UserCircle className="w-5 h-5 text-muted-foreground"/> <strong>Représentant Légal :</strong> Cristan Dev</p>
            </NeumorphicCard>
          </section>

          <Separator />

          {/* Section Hébergement */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <Globe className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold font-headline">Hébergement</h2>
            </div>
            <NeumorphicCard inset className="p-4 sm:p-6 space-y-2">
              <p>Ce site est hébergé par Firebase, un service de Google.</p>
              <p><strong>Hébergeur :</strong> Google LLC</p>
              <p><strong>Adresse :</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
            </NeumorphicCard>
          </section>

          <Separator />

          {/* Section Propriété Intellectuelle */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold font-headline">Propriété Intellectuelle</h2>
            </div>
            <NeumorphicCard inset className="p-4 sm:p-6">
              <p className="text-muted-foreground leading-relaxed">
                L'ensemble de ce site relève de la législation sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques. La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
            </NeumorphicCard>
          </section>

          <Separator />

          {/* Section Données Personnelles */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <UserCircle className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold font-headline">Données Personnelles</h2>
            </div>
            <NeumorphicCard inset className="p-4 sm:p-6">
              <p className="text-muted-foreground leading-relaxed">
                Les informations recueillies via les formulaires de contact ou de création de compte sont enregistrées dans un fichier informatisé géré par Cristan pour assurer la gestion de la relation client et des partenariats. Les données sont conservées pendant la durée de la relation commerciale et sont destinées uniquement à l'usage interne de Cristan. Conformément à la loi, vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier en contactant : kingstartup2@gmail.com.
              </p>
            </NeumorphicCard>
          </section>

        </div>
      </NeumorphicCard>
    </div>
  );
}
