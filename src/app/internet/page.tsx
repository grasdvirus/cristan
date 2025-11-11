
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProjectsGrid from "@/components/sections/projects-grid";
import { NeumorphicCard } from "@/components/neumorphic-card";

export default function InternetPage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
                 <h1 className="text-3xl sm:text-4xl font-bold font-headline text-center sm:text-left">
                    Tous les Sites Internet
                </h1>
                <Button asChild variant="outline" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à l'accueil
                    </Link>
                </Button>
            </div>
            <ProjectsGrid />
        </div>
    )
}
