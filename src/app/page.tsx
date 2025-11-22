
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/sections/hero-section';
import MarqueeSection from '@/components/sections/marquee-section';
import ProjectsGrid from '@/components/sections/projects-grid';
import { HomeTVSection } from '@/components/sections/videos-grid';
import GamesGrid from '@/components/sections/games-grid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Handshake, Plus } from 'lucide-react';
import Link from 'next/link';
import { CustomProjectButton } from '@/components/custom-project-button';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import AvisClientsMarquee from '@/components/sections/avis-clients-marquee';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';

type Project = {
    id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    imageHint: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('sites');
  const { toast } = useToast();
  const router = useRouter();
  const { firestore } = useFirebase();

  const projectsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'projects')) : null, [firestore]);
  const { data: allProjects } = useCollection<Project>(projectsQuery);
  const homeProjects = allProjects?.slice(0, 4);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedCristan');
    if (!hasVisited) {
      const timer = setTimeout(() => {
        toast({
          variant: 'default',
          title: "Besoin d'aide ?",
          description: "Notre assistant virtuel peut répondre à vos questions.",
          action: <ToastAction altText="Discuter" onClick={() => router.push('/about')}>Discuter</ToastAction>,
        });
        sessionStorage.setItem('hasVisitedCristan', 'true');
      }, 5000); // 5 secondes

      return () => clearTimeout(timer);
    }
  }, [toast, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div>
      <HeroSection />
      <MarqueeSection />
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col items-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-8 text-center">
                À découvrir
              </h2>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-4xl">
                  <TabsList className="bg-transparent p-0 flex-wrap justify-center h-auto">
                    <TabsTrigger 
                        value="sites" 
                        className="text-lg font-bold bg-transparent shadow-none px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                        internet
                    </TabsTrigger>
                    <TabsTrigger 
                        value="videos" 
                        className="text-lg font-bold bg-transparent shadow-none px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                        TV
                    </TabsTrigger>
                    <TabsTrigger 
                        value="games" 
                        className="text-lg font-bold bg-transparent shadow-none px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                        Gamme
                    </TabsTrigger>
                     <TabsTrigger 
                        value="partnership"
                        className="text-lg font-bold bg-transparent shadow-none px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
                     >
                        Partenariat
                     </TabsTrigger>
                  </TabsList>

                  <div className="mt-12">
                     <TabsContent value="sites">
                        <div className="flex justify-between items-center mb-8">
                            <Button asChild variant="outline" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                                <Link href="/internet">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Voir plus ({allProjects?.length || 0})
                                </Link>
                            </Button>
                            <CustomProjectButton />
                        </div>
                        <ProjectsGrid projects={homeProjects} isLoading={!homeProjects}/>
                     </TabsContent>
                     <TabsContent value="videos">
                        <HomeTVSection />
                     </TabsContent>
                     <TabsContent value="games">
                        <GamesGrid />
                     </TabsContent>
                     <TabsContent value="partnership">
                        <NeumorphicCard className="text-center p-8">
                            <div className="flex justify-center mb-4">
                                <Handshake className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold font-headline">Rejoignez Notre Programme Partenaire</h3>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                Collaborez avec nous, bénéficiez d'avantages exclusifs et suivez vos performances sur votre tableau de bord personnel.
                            </p>
                            <Button asChild size="lg" className="mt-6 btn-neumorphic-light dark:btn-neumorphic-dark">
                                <Link href="/partner/register">
                                    Accéder à l'espace partenaire
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </NeumorphicCard>
                     </TabsContent>
                  </div>
              </Tabs>
          </div>
        </div>
      </div>
      <AvisClientsMarquee />
    </div>
  );
}
