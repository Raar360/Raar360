import { cn } from "@/lib/utils/cn";

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
}

export function SafeArea({ children, className }: SafeAreaProps) {
  return (
    <div className={cn("px-4 pb-safe pt-safe md:px-8", className)}>{children}</div>
  );
}
