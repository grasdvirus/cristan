import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className={cn("container flex items-center justify-center py-6")}>
        <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold underline underline-offset-4">
          À propos de cristan
        </Link>
      </div>
    </footer>
  );
}
