import { cn } from "@/lib/utils/cn";
import { comicArt } from "@/lib/art/style";

interface LeoProps {
  className?: string;
  variant?: "full" | "bust";
}

export function Leo({ className, variant = "full" }: LeoProps) {
  const { outline, skin, skinShadow, hair, hairHighlight, leoHoodie, leoHoodieShadow, leoJeans, leoJeansShadow, leoShoes } =
    comicArt;

  if (variant === "bust") {
    return (
      <svg viewBox="0 0 80 90" className={cn("h-full w-full", className)} aria-hidden>
        <path
          d="M20 35 C18 18 28 8 40 8 C52 8 62 18 60 35 C62 42 58 48 40 50 C22 48 18 42 20 35Z"
          fill={hair}
          stroke={outline}
          strokeWidth="2"
        />
        <path d="M24 22 C30 14 50 14 56 22" fill={hairHighlight} opacity="0.6" />
        <ellipse cx="40" cy="48" rx="22" ry="24" fill={skinShadow} />
        <ellipse cx="40" cy="45" rx="22" ry="24" fill={skin} stroke={outline} strokeWidth="2.5" />
        <ellipse cx="32" cy="44" rx="4" ry="5" fill="white" stroke={outline} strokeWidth="1.5" />
        <ellipse cx="48" cy="44" rx="4" ry="5" fill="white" stroke={outline} strokeWidth="1.5" />
        <circle cx="32" cy="45" r="2.5" fill={outline} />
        <circle cx="48" cy="45" r="2.5" fill={outline} />
        <path d="M34 56 Q40 61 46 56" fill="none" stroke={outline} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 75 Q40 68 62 75 L58 90 L22 90 Z" fill={leoHoodieShadow} />
        <path d="M16 72 Q40 65 64 72 L60 90 L20 90 Z" fill={leoHoodie} stroke={outline} strokeWidth="2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 180" className={cn("h-full w-full", className)} aria-hidden>
      {/* Hair */}
      <path
        d="M35 38 C32 18 45 6 60 6 C75 6 88 18 85 38 C87 44 82 50 60 52 C38 50 33 44 35 38Z"
        fill={hair}
        stroke={outline}
        strokeWidth="2.5"
      />
      <path d="M40 20 C48 12 72 12 80 22" fill={hairHighlight} opacity="0.5" />
      {/* Face */}
      <ellipse cx="60" cy="48" rx="26" ry="28" fill={skinShadow} />
      <ellipse cx="60" cy="45" rx="26" ry="28" fill={skin} stroke={outline} strokeWidth="2.5" />
      <ellipse cx="50" cy="44" rx="5" ry="6" fill="white" stroke={outline} strokeWidth="1.5" />
      <ellipse cx="70" cy="44" rx="5" ry="6" fill="white" stroke={outline} strokeWidth="1.5" />
      <circle cx="50" cy="45" r="3" fill={outline} />
      <circle cx="70" cy="45" r="3" fill={outline} />
      <circle cx="51" cy="44" r="1" fill="white" />
      <circle cx="71" cy="44" r="1" fill="white" />
      <path d="M52 58 Q60 64 68 58" fill="none" stroke={outline} strokeWidth="2" strokeLinecap="round" />
      {/* Hoodie */}
      <path d="M32 78 L28 130 L92 130 L88 78 Q60 68 32 78Z" fill={leoHoodieShadow} />
      <path d="M30 75 L26 128 L94 128 L90 75 Q60 64 30 75Z" fill={leoHoodie} stroke={outline} strokeWidth="2.5" />
      <path d="M30 75 Q60 88 90 75" fill="none" stroke={outline} strokeWidth="2" />
      {/* Arms */}
      <rect x="18" y="82" width="14" height="38" rx="7" fill={skinShadow} />
      <rect x="16" y="80" width="14" height="38" rx="7" fill={skin} stroke={outline} strokeWidth="2" />
      <rect x="88" y="82" width="14" height="38" rx="7" fill={skinShadow} />
      <rect x="86" y="80" width="14" height="38" rx="7" fill={skin} stroke={outline} strokeWidth="2" />
      {/* Jeans */}
      <rect x="36" y="126" width="20" height="42" rx="4" fill={leoJeansShadow} />
      <rect x="34" y="124" width="20" height="42" rx="4" fill={leoJeans} stroke={outline} strokeWidth="2" />
      <rect x="64" y="126" width="20" height="42" rx="4" fill={leoJeansShadow} />
      <rect x="62" y="124" width="20" height="42" rx="4" fill={leoJeans} stroke={outline} strokeWidth="2" />
      {/* Shoes */}
      <ellipse cx="44" cy="170" rx="14" ry="6" fill={leoShoes} stroke={outline} strokeWidth="2" />
      <ellipse cx="76" cy="170" rx="14" ry="6" fill={leoShoes} stroke={outline} strokeWidth="2" />
    </svg>
  );
}
