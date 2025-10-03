"use client";

import { useState } from 'react';
import HeroSection from '@/components/sections/hero-section';
import ProjectsGrid from '@/components/sections/projects-grid';
import VideosGrid from '@/components/sections/videos-grid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [activeTab, setActiveTab] = useState('sites');

  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold font-headline mb-8 text-center">
              Mes Créations
            </h2>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-transparent p-0">
                <TabsTrigger 
                    value="sites" 
                    className="text-lg bg-transparent shadow-none px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                    Sites Web
                </TabsTrigger>
                <TabsTrigger 
                    value="videos" 
                    className="text-lg bg-transparent shadow-none px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                    Vidéos
                </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        {activeTab === 'sites' && <ProjectsGrid />}
        {activeTab === 'videos' && <VideosGrid />}
      </div>
    </div>
  );
}
