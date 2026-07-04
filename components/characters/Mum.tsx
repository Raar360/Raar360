import { cn } from "@/lib/utils/cn";
import { comicArt } from "@/lib/art/style";

interface MumProps {
  className?: string;
  variant?: string;
}

export function Mum({ className, variant = "doorway" }: MumProps) {
  const { outline, skin, skinShadow } = comicArt;

  return (
    <svg viewBox="0 0 80 140" className={cn("h-full w-full", className)} aria-hidden>
      <ellipse cx="40" cy="28" rx="18" ry="20" fill={skinShadow} />
      <ellipse cx="40" cy="25" rx="18" ry="20" fill={skin} stroke={outline} strokeWidth="2.5" />
      <path
        d="M22 18 C24 8 56 8 58 18 L60 35 C58 42 52 48 40 50 C28 48 22 42 22 35 Z"
        fill="#6B4423"
        stroke={outline}
        strokeWidth="2"
      />
      <ellipse cx="34" cy="26" rx="3" ry="4" fill="white" stroke={outline} strokeWidth="1.5" />
      <ellipse cx="46" cy="26" rx="3" ry="4" fill="white" stroke={outline} strokeWidth="1.5" />
      <circle cx="34" cy="27" r="2" fill={outline} />
      <circle cx="46" cy="27" r="2" fill={outline} />
      <path d="M34 36 Q40 40 46 36" fill="none" stroke={outline} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 52 L14 130 L66 130 L62 52 Q40 44 18 52Z" fill="#E8A598" stroke={outline} strokeWidth="2.5" />
      {variant === "hugging" && (
        <path d="M10 70 Q40 55 70 70" fill="none" stroke={outline} strokeWidth="2.5" strokeLinecap="round" />
      )}
      {variant === "doorway" && (
        <rect x="-10" y="0" width="8" height="140" fill="#EDE0CE" stroke={outline} strokeWidth="2" />
      )}
    </svg>
  );
}
