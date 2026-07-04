import { cn } from "@/lib/utils/cn";

interface LeoProps {
  className?: string;
}

export function Leo({ className }: LeoProps) {
  return (
    <svg viewBox="0 0 120 160" className={cn("h-full w-full", className)} aria-hidden>
      <ellipse cx="60" cy="42" rx="28" ry="30" fill="#F5D0A9" stroke="#3D2914" strokeWidth="3" />
      <path d="M32 38 C28 20 40 8 60 8 C80 8 92 20 88 38" fill="#5C4033" stroke="#3D2914" strokeWidth="2" />
      <circle cx="48" cy="42" r="4" fill="#3D2914" />
      <circle cx="72" cy="42" r="4" fill="#3D2914" />
      <path d="M52 54 Q60 60 68 54" fill="none" stroke="#3D2914" strokeWidth="2" strokeLinecap="round" />
      <rect x="42" y="72" width="36" height="48" rx="8" fill="#7EB8DA" stroke="#3D2914" strokeWidth="3" />
      <rect x="34" y="78" width="16" height="36" rx="8" fill="#F5D0A9" stroke="#3D2914" strokeWidth="2" />
      <rect x="70" y="78" width="16" height="36" rx="8" fill="#F5D0A9" stroke="#3D2914" strokeWidth="2" />
      <rect x="48" y="118" width="12" height="34" rx="6" fill="#5C4033" stroke="#3D2914" strokeWidth="2" />
      <rect x="60" y="118" width="12" height="34" rx="6" fill="#5C4033" stroke="#3D2914" strokeWidth="2" />
    </svg>
  );
}
