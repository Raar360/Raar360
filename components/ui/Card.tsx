import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-soft border-2 border-outline/15 bg-white/70 p-6 shadow-gentle backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
