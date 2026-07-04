"use client";

import Link from "next/link";
import { Pip } from "@/components/characters/Pip";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
}

export function AppShell({ children, className, showFooter = true }: AppShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col overflow-x-hidden bg-cream text-warm-brown",
        className,
      )}
    >
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 md:px-8 md:py-10">
        {children}
      </main>
      {showFooter && (
        <footer className="shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
          <Link
            href="/coach"
            className="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-4 opacity-40 transition-opacity hover:opacity-70 active:opacity-90"
            aria-label="Coach mode"
          >
            <Pip expression="neutral" size="sm" />
            <span className="text-xs">Pip&apos;s Backpack</span>
          </Link>
        </footer>
      )}
    </div>
  );
}
