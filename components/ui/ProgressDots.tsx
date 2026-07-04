import { cn } from "@/lib/utils/cn";

interface ProgressDotsProps {
  total: number;
  current: number;
  className?: string;
}

export function ProgressDots({ total, current, className }: ProgressDotsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} aria-hidden>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-colors",
            index === current ? "bg-golden scale-110" : "bg-outline/20",
          )}
        />
      ))}
    </div>
  );
}
