
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import GamesGrid from "@/components/sections/games-grid";
import { NeumorphicCard } from "@/components/neumorphic-card";

export default function GammePage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
             <div className="mb-8">
                <Button asChild variant="ghost" size="icon" className="rounded-full btn-neumorphic-light dark:btn-neumorphic-dark">
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
            </div>
            <div className="relative flex flex-col sm:flex-row justify-center items-center mb-12 gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline text-center">
                    Toute la Gamme
                </h1>
            </div>
            <GamesGrid />
        </div>
    )
}
