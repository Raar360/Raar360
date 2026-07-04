"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-golden text-outline shadow-gentle hover:bg-golden/90 focus-visible:ring-golden/50",
  soft: "bg-blush/30 text-warm-brown hover:bg-blush/50 focus-visible:ring-blush/50",
  ghost: "bg-transparent text-warm-brown hover:bg-cream/80 focus-visible:ring-soft-blue/50",
};

const sizes = {
  sm: "min-h-11 px-4 py-2.5 text-sm rounded-xl",
  md: "min-h-12 px-6 py-3 text-base rounded-2xl",
  lg: "min-h-14 px-8 py-4 text-lg rounded-2xl",
};

interface ButtonProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  type = "button",
  onClick,
}: ButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.97 }}
      className={cn(
        "inline-flex w-full items-center justify-center font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 sm:w-auto",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
