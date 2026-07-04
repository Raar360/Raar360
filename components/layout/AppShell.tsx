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
    <div className={cn("min-h-screen bg-cream text-warm-brown", className)}>
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 md:px-8 md:py-10">
        {children}
      </main>
      {showFooter && (
        <footer className="pb-6 text-center">
          <Link
            href="/coach"
            className="inline-flex flex-col items-center gap-1 opacity-40 transition-opacity hover:opacity-70"
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
