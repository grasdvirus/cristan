
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/sections/hero-section';
import ProjectsGrid from '@/components/sections/projects-grid';
import { HomeTVSection } from '@/components/sections/videos-grid';
import GamesGrid from '@/components/sections/games-grid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Handshake } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState('sites');
  const router = useRouter();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div>
      <HeroSection />
      <div className="bg-background">
        <div className="container mx-auto px-4 py-16 sm:py-24">
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
                    {activeTab === 'sites' && <ProjectsGrid />}
                    {activeTab === 'videos' && <HomeTVSection />}
                    {activeTab === 'games' && <GamesGrid />}
                    {activeTab === 'partnership' && (
                        <NeumorphicCard inset className="text-center p-8">
                            <div className="flex justify-center mb-4">
                                <Handshake className="w-12 h-12 text-primary"/>
                            </div>
                            <h3 className="text-2xl font-bold font-headline">Devenez Partenaire Cristan</h3>
                            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                                Rejoignez notre programme d'affiliation et commencez à gagner des récompenses en partageant nos services. Accédez à votre tableau de bord et suivez vos performances en temps réel.
                            </p>
                            <Button asChild size="lg" className="mt-6 btn-neumorphic-light dark:btn-neumorphic-dark">
                                <Link href="/partner">
                                    Accéder à l'espace partenaire
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </NeumorphicCard>
                    )}
                  </div>
              </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
