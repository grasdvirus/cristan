import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50">
      <div className={cn("container flex items-center justify-center py-6")}>
        <p className="text-sm text-muted-foreground">
          © {currentYear} Mon Portfolio Personnel. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
