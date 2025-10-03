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
        <div className="flex justify-center mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark p-2">
              <TabsTrigger value="sites" className="text-lg data-[state=active]:neumorphic-card-light dark:data-[state=active]:neumorphic-card-dark">
                Sites Web
              </TabsTrigger>
              <TabsTrigger value="videos" className="text-lg data-[state=active]:neumorphic-card-light dark:data-[state=active]:neumorphic-card-dark">
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
