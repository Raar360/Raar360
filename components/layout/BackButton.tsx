import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = "Back", className }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center gap-2 rounded-full px-3 py-2 text-warm-brown/80 transition-colors hover:text-warm-brown active:text-warm-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-blue/50",
        className,
      )}
    >
      <span aria-hidden className="text-lg">←</span>
      <span className="text-sm sm:text-base">{label}</span>
    </Link>
  );
}
