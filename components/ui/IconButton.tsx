"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface IconButtonProps {
  label: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export function IconButton({ label, className, children, disabled, onClick }: IconButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.97 }}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-outline/20 bg-white/80 text-warm-brown shadow-gentle transition-colors hover:bg-cream focus-visible:ring-2 focus-visible:ring-soft-blue/50",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
