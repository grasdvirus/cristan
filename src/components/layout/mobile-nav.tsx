
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Home, ShoppingBag, Mail, User } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart-store';


const navLinks = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/decouvrir', label: 'Découvrir', icon: ShoppingBag },
  { href: '/contact', label: 'Email', icon: Mail },
  { href: '/profile', label: 'Profil', icon: User },
];

const MobileNav = () => {
  const pathname = usePathname();
  const { items } = useCartStore();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const activeLinkIndex = navLinks.findIndex(link => {
        if (link.href === '/') {
          return pathname === '/';
        }
        return pathname.startsWith(link.href)
      });
      setActiveIndex(activeLinkIndex >= 0 ? activeLinkIndex : 0);
    }
  }, [pathname, isMounted]);

  if (!isMounted || pathname === '/login' || pathname.startsWith('/admin')) {
    return null;
  }
  
  const navItems = navLinks;
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
       <nav className="mobile-nav-glass">
          {navItems.map((link, index) => (
          <Link
              key={link.href}
              href={link.href}
              className={cn(
              'relative flex flex-col items-center justify-center gap-1 !min-w-[80px]',
              { 'active': index === activeIndex }
              )}
          >
              <link.icon className="h-5 w-5" />
              <span className="text-xs">{link.label}</span>
              {link.href === '/decouvrir' && items.length > 0 && (
                <span className="absolute top-0 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {items.length}
                </span>
              )}
          </Link>
          ))}
          { activeIndex !== -1 && <div className="mobile-nav-glider" data-active-index={activeIndex}></div> }
      </nav>
    </div>
  );
};

export default MobileNav;
