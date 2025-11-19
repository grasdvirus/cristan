
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import VideosGrid from "@/components/sections/videos-grid";
import { NeumorphicCard } from "@/components/neumorphic-card";

export default function TvPage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="relative flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
                 <Button asChild variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-3xl sm:text-4xl font-bold font-headline text-center sm:text-left sm:pl-16">
                    Toutes les Vidéos
                </h1>
            </div>
            <VideosGrid />
        </div>
    )
}
