
'use client';

import { useEffect, useState } from 'react';
import { Button } from './button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="icon"
        onClick={scrollToTop}
        className={cn(
          'transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        aria-label="Remonter en haut"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
