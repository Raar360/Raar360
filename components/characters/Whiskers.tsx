import { cn } from "@/lib/utils/cn";
import { comicArt } from "@/lib/art/style";

interface WhiskersProps {
  className?: string;
  variant?: string;
}

export function Whiskers({ className, variant = "sitting" }: WhiskersProps) {
  const { outline } = comicArt;

  return (
    <svg viewBox="0 0 80 60" className={cn("h-full w-full", className)} aria-hidden>
      <ellipse cx="40" cy="38" rx="28" ry="18" fill="#D4843C" stroke={outline} strokeWidth="2.5" />
      <ellipse cx="40" cy="35" rx="26" ry="16" fill="#F5D5A8" stroke={outline} strokeWidth="2" />
      <path
        d="M20 30 C25 20 35 18 40 22 C45 18 55 20 60 30"
        fill="#D4843C"
        stroke={outline}
        strokeWidth="2"
      />
      <ellipse cx="32" cy="28" rx="4" ry={variant === "purring" ? 2 : 5} fill="#6BAA6B" stroke={outline} strokeWidth="1.5" />
      <ellipse cx="48" cy="28" rx="4" ry={variant === "purring" ? 2 : 5} fill="#6BAA6B" stroke={outline} strokeWidth="1.5" />
      <circle cx="32" cy="28" r="2" fill={outline} />
      <circle cx="48" cy="28" r="2" fill={outline} />
      {variant === "meowing" && (
        <ellipse cx="40" cy="42" rx="5" ry="4" fill={outline} />
      )}
      {variant === "in-box" && (
        <rect x="5" y="45" width="70" height="15" rx="2" fill="#B8956A" stroke={outline} strokeWidth="2" opacity="0.5" />
      )}
      <path d="M18 32 L8 28 M18 34 L6 34" stroke={outline} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M62 32 L72 28 M62 34 L74 34" stroke={outline} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
