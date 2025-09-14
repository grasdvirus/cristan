

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Mail, User, Filter, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useArticleCategories } from '@/lib/data';
import { useState, useMemo } from 'react';
import { useFilterStore } from '@/hooks/use-filter-store';
import { useCartStore } from '@/hooks/use-cart-store';
import { useProducts } from '@/hooks/use-products';
import { useViewStore } from '@/hooks/use-view-store';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/decouvrir', label: 'Découvrir', icon: ShoppingBag },
  { href: '/contact', label: 'Email', icon: Mail },
];

const Header = () => {
  const pathname = usePathname();
  const isDiscoverPage = pathname.startsWith('/decouvrir') || pathname.startsWith('/artwork') || pathname.startsWith('/panier') || pathname.startsWith('/paiement');
  const isHomePage = pathname === '/';
  const { activeArticleCategory, setArticleCategory } = useFilterStore();
  const articleCategories = useArticleCategories();
  const { items } = useCartStore();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { products } = useProducts();
  const { viewedArticleIds } = useViewStore();

  const articleProducts = useMemo(() => products.filter(p => p.articleCategory), [products]);

  const newArticlesCount = useMemo(() => {
    return articleProducts.filter(p => !viewedArticleIds.includes(p.id)).length;
  }, [articleProducts, viewedArticleIds]);

  const newArticlesPerCategory = useMemo(() => {
    const counts: { [key: string]: number } = {};
    articleProducts.forEach(p => {
        if (!viewedArticleIds.includes(p.id) && p.articleCategory) {
            counts[p.articleCategory] = (counts[p.articleCategory] || 0) + 1;
        }
    });
    return counts;
  }, [articleProducts, viewedArticleIds]);


  const handleFilterChange = (category: string) => {
    setArticleCategory(category);
    setPopoverOpen(false);
    setSheetOpen(false);
  };
  
  const FilterContent = () => (
    <div className="p-1 flex flex-col space-y-1">
      <Button
          variant={activeArticleCategory === 'all' ? 'secondary' : 'ghost'}
          onClick={() => handleFilterChange('all')}
          className="justify-start px-2"
      >
          Toutes les catégories
      </Button>
      {articleCategories.map((category) => (
        <Button
            key={category.id}
            variant={activeArticleCategory === category.id ? 'secondary' : 'ghost'}
            onClick={() => handleFilterChange(category.id)}
            className="justify-between px-2 w-full"
        >
            <span>{category.label}</span>
            {newArticlesPerCategory[category.id] > 0 && (
                <Badge variant="destructive" className="h-5">{newArticlesPerCategory[category.id]}</Badge>
            )}
        </Button>
      ))}
    </div>
  );
  
  const NavLink = ({ href, label, icon: Icon }: (typeof navLinks)[0]) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10',
        pathname === href ? 'text-primary' : 'text-foreground/80 hover:text-primary'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );

  const CartButton = () => (
    <Button variant="ghost" size="icon" aria-label="Panier" asChild>
      <Link href="/panier" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {items.length}
          </span>
        )}
      </Link>
    </Button>
  );

  const FilterButton = ({ isPopover = false }) => {
     const Trigger = (
         <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filtre
            {newArticlesCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2">{newArticlesCount}</Badge>
            )}
        </Button>
     );

     if (isPopover) {
        return (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>{Trigger}</PopoverTrigger>
                <PopoverContent className="w-56 p-0"><FilterContent /></PopoverContent>
            </Popover>
        )
     }

     return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Filter className="h-5 w-5" />
                    {newArticlesCount > 0 && (
                         <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{newArticlesCount}</Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-lg">
                <SheetHeader className="text-left">
                    <SheetTitle>Filtrer les actualités</SheetTitle>
                </SheetHeader>
                <div className="py-4"><FilterContent /></div>
            </SheetContent>
        </Sheet>
     );
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 hidden w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex-1">
            {isHomePage && <FilterButton isPopover={true} />}
          </div>
          <Link href="/" className="flex flex-1 justify-center items-center gap-2">
            <span className="font-headline text-xl font-bold text-foreground">Cristan</span>
          </Link>
          <nav className="flex flex-1 items-center justify-end gap-4">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
             <Button variant="ghost" size="icon" aria-label="Profil" asChild>
                <Link href="/profile">
                    <User className="h-5 w-5" />
                </Link>
            </Button>
            {isDiscoverPage && (
              <CartButton />
            )}
          </nav>
        </div>
      </header>
      
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex w-full justify-between items-center md:hidden border-b border-border/40 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-1 items-center justify-start gap-2">
           {isHomePage && <FilterButton isPopover={false} />}
        </div>
        <Link href="/" className="flex-1 flex justify-center items-center gap-2">
          <span className="font-headline text-xl font-bold text-foreground">Cristan</span>
        </Link>
         <div className="flex flex-1 items-center justify-end gap-2">
            {isDiscoverPage && (
                <CartButton />
            )}
            <Button variant="ghost" size="icon" aria-label="Profil" asChild>
                <Link href="/profile">
                    <User className="h-5 w-5" />
                </Link>
            </Button>
        </div>
      </header>
    </>
  );
};

export default Header;

