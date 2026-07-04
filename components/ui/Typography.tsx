import { cn } from "@/lib/utils/cn";

const styles = {
  story: "text-[1.125rem] leading-[1.7] text-warm-brown font-medium sm:text-xl md:text-2xl md:leading-relaxed",
  wonder: "text-[1.625rem] leading-snug text-warm-brown font-semibold sm:text-2xl md:text-4xl",
  pocket: "text-[1.125rem] leading-[1.7] text-warm-brown italic sm:text-xl md:text-2xl",
  label: "text-xs uppercase tracking-wide text-warm-brown/70 font-semibold sm:text-sm",
  title: "text-[1.75rem] font-bold text-warm-brown sm:text-3xl md:text-5xl",
  subtitle: "text-base text-warm-brown/80 sm:text-lg md:text-xl",
};

interface TypographyProps {
  variant: keyof typeof styles;
  children: React.ReactNode;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
}

export function Typography({
  variant,
  children,
  className,
  as: Tag = "p",
}: TypographyProps) {
  return <Tag className={cn(styles[variant], className)}>{children}</Tag>;
}
