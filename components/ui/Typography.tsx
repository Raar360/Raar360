import { cn } from "@/lib/utils/cn";

const styles = {
  story: "text-xl md:text-2xl leading-relaxed text-warm-brown font-medium",
  wonder: "text-2xl md:text-4xl leading-snug text-warm-brown font-semibold",
  pocket: "text-xl md:text-2xl leading-relaxed text-warm-brown italic",
  label: "text-sm uppercase tracking-wide text-warm-brown/70 font-semibold",
  title: "text-3xl md:text-5xl font-bold text-warm-brown",
  subtitle: "text-lg md:text-xl text-warm-brown/80",
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
