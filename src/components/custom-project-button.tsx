
'use client';

import Link from 'next/link';
import { useState, MouseEvent } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function CustomProjectButton() {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (isMobile) {
      if (!isExpanded) {
        e.preventDefault();
        setIsExpanded(true);
      }
      // On the second click, isExpanded is true, so the default Link behavior proceeds.
    }
  };

  const handleBlur = () => {
    if (isMobile) {
        setIsExpanded(false);
    }
  }

  return (
    <Link href="/custom-project" passHref>
      <button
        className={cn('custom-project-button', { expanded: isExpanded })}
        onClick={handleClick}
        onBlur={handleBlur}
      >
        <svg className="svgIcon" viewBox="0 0 384 512">
            <path
            d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
            ></path>
        </svg>
      </button>
    </Link>
  );
}
