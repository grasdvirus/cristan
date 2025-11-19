import { cn } from "@/lib/utils";
import Link from "next/link";
import { Separator } from "../ui/separator";

export default function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className={cn("container flex items-center justify-center py-6 gap-4")}>
        <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold underline">
          À propos de Cristan
        </Link>
        <Separator orientation="vertical" className="h-4" />
        <Link href="/legal" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold underline">
          Mentions Légales
        </Link>
      </div>
    </footer>
  );
}
