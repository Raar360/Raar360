"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { PipExpression } from "@/types";

const sizes = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

interface PipProps {
  expression?: PipExpression;
  size?: keyof typeof sizes;
  className?: string;
}

export function Pip({ expression = "neutral", size = "md", className }: PipProps) {
  const reduceMotion = useReducedMotion();

  const eyeScaleY =
    expression === "excited" ? 1.15 : expression === "gentle" ? 0.92 : 1;

  return (
    <motion.div
      className={cn("relative", sizes[size], className)}
      animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-gentle" aria-hidden>
        <ellipse cx="50" cy="58" rx="34" ry="30" fill="#7EB8DA" stroke="#3D2914" strokeWidth="3" />
        <ellipse cx="36" cy="50" rx="10" ry={12 * eyeScaleY} fill="white" stroke="#3D2914" strokeWidth="2" />
        <ellipse cx="64" cy="50" rx="10" ry={12 * eyeScaleY} fill="white" stroke="#3D2914" strokeWidth="2" />
        <circle cx="36" cy="52" r="5" fill="#3D2914" />
        <circle cx="64" cy="52" r="5" fill="#3D2914" />
        {expression === "excited" && (
          <path d="M38 68 Q50 78 62 68" fill="none" stroke="#3D2914" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {expression === "curious" && (
          <circle cx="50" cy="66" r="3" fill="#3D2914" />
        )}
        {expression === "gentle" && (
          <path d="M40 67 Q50 72 60 67" fill="none" stroke="#3D2914" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {expression === "neutral" && (
          <path d="M42 67 L58 67" fill="none" stroke="#3D2914" strokeWidth="2.5" strokeLinecap="round" />
        )}
        <rect x="62" y="62" width="18" height="14" rx="3" fill="#F4C542" stroke="#3D2914" strokeWidth="2" />
        <path d="M68 62 L74 54 L80 62" fill="#F4C542" stroke="#3D2914" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}
