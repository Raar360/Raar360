import { cn } from "@/lib/utils/cn";
import { comicArt } from "@/lib/art/style";

interface DadProps {
  className?: string;
  variant?: string;
}

export function Dad({ className, variant = "doorway" }: DadProps) {
  const { outline, skin, skinShadow } = comicArt;

  return (
    <svg viewBox="0 0 80 140" className={cn("h-full w-full", className)} aria-hidden>
      <ellipse cx="40" cy="28" rx="18" ry="20" fill={skinShadow} />
      <ellipse cx="40" cy="25" rx="18" ry="20" fill={skin} stroke={outline} strokeWidth="2.5" />
      <path
        d="M28 20 C30 12 50 12 52 20"
        fill="#6B4423"
        stroke={outline}
        strokeWidth="2"
      />
      <ellipse cx="34" cy="26" rx="3" ry="4" fill="white" stroke={outline} strokeWidth="1.5" />
      <ellipse cx="46" cy="26" rx="3" ry="4" fill="white" stroke={outline} strokeWidth="1.5" />
      <circle cx="34" cy="27" r="2" fill={outline} />
      <circle cx="46" cy="27" r="2" fill={outline} />
      {variant === "winking" ? (
        <path d="M32 34 Q40 40 48 34" fill="none" stroke={outline} strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M34 36 Q40 40 46 36" fill="none" stroke={outline} strokeWidth="2" strokeLinecap="round" />
      )}
      <path d="M20 50 L16 130 L64 130 L60 50 Q40 42 20 50Z" fill="#4A7FC1" stroke={outline} strokeWidth="2.5" />
      {variant === "doorway" && (
        <rect x="-10" y="0" width="8" height="140" fill="#EDE0CE" stroke={outline} strokeWidth="2" />
      )}
    </svg>
  );
}
