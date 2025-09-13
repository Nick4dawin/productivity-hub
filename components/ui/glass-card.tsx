'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass morphism styles
          'backdrop-blur-xl bg-white/5 border border-white/10',
          // Rounded corners and shadow
          'rounded-xl shadow-2xl shadow-black/20',
          // Hover effects
          'hover:bg-white/10 hover:border-white/20',
          // Transition
          'transition-all duration-300 ease-out',
          // Custom className
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };