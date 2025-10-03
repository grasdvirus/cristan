import { NeumorphicCard } from '@/components/neumorphic-card';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <NeumorphicCard className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold font-headline">Panneau d'administration</h1>
        </div>
        <p className="text-muted-foreground">
            Bienvenue dans l'espace d'administration.
        </p>
      </NeumorphicCard>
    </div>
  );
}
