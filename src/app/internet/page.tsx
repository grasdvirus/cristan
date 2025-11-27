'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ProjectsGrid from "@/components/sections/projects-grid";
import { NeumorphicCard } from "@/components/neumorphic-card";

export default function InternetPage() {
    const router = useRouter();
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="mb-8">
                 <Button onClick={() => router.back()} variant="ghost" size="icon" className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </div>
            <div className="relative flex flex-col sm:flex-row justify-center items-center mb-12 gap-4">
                 <h1 className="text-3xl sm:text-4xl font-bold font-headline text-center">
                    Tous les Sites Internet
                </h1>
            </div>
            <ProjectsGrid />
        </div>
    )
}
