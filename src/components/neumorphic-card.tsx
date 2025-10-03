import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

type NeumorphicCardProps = HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
  inset?: boolean;
};

export function NeumorphicCard({
  className,
  children,
  as: Comp = 'div',
  inset = false,
  ...props
}: NeumorphicCardProps) {
  return (
    <Comp
      className={cn(
        'rounded-2xl p-6 bg-background transition-all duration-300',
        inset
          ? 'neumorphic-card-inset-light dark:neumorphic-card-inset-dark'
          : 'neumorphic-card-light dark:neumorphic-card-dark',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
