"use client";

import { cn } from "@/lib/utils/cn";

interface MobileActionBarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Sticky bottom bar for thumb-friendly controls on mobile.
 * Respects iOS home indicator via safe-area padding.
 */
export function MobileActionBar({ children, className }: MobileActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 mt-auto border-t border-outline/10 bg-cream/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
