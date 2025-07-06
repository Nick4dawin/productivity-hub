import React from 'react';
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassCard = ({ className, children, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-card-foreground shadow-lg p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}; 