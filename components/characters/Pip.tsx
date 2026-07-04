"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { comicArt } from "@/lib/art/style";
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
  const { outline, pipBody, pipBodyShadow, pipFluff, pipBackpack, pipBackpackShadow } = comicArt;

  const eyeRy = expression === "excited" ? 13 : expression === "gentle" ? 10 : 12;

  return (
    <motion.div
      className={cn("relative", sizes[size], className)}
      animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-gentle" aria-hidden>
        {/* Antennae */}
        <line x1="38" y1="22" x2="34" y2="8" stroke={outline} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="62" y1="22" x2="66" y2="8" stroke={outline} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="34" cy="8" r="3" fill={pipFluff} stroke={outline} strokeWidth="2" />
        <circle cx="66" cy="8" r="3" fill={pipFluff} stroke={outline} strokeWidth="2" />
        {/* Fluffy body */}
        <ellipse cx="50" cy="58" rx="32" ry="28" fill={pipBodyShadow} />
        <ellipse cx="50" cy="55" rx="32" ry="28" fill={pipBody} stroke={outline} strokeWidth="2.5" />
        <ellipse cx="38" cy="48" rx="8" ry="10" fill={pipFluff} opacity="0.5" />
        <ellipse cx="62" cy="48" rx="8" ry="10" fill={pipFluff} opacity="0.5" />
        {/* Big expressive eyes */}
        <ellipse cx="38" cy="52" rx="11" ry={eyeRy} fill="white" stroke={outline} strokeWidth="2" />
        <ellipse cx="62" cy="52" rx="11" ry={eyeRy} fill="white" stroke={outline} strokeWidth="2" />
        <circle cx="38" cy="54" r="5" fill={outline} />
        <circle cx="62" cy="54" r="5" fill={outline} />
        <circle cx="40" cy="52" r="1.5" fill="white" />
        <circle cx="64" cy="52" r="1.5" fill="white" />
        {/* Mouth */}
        {expression === "excited" && (
          <path d="M36 70 Q50 80 64 70" fill="none" stroke={outline} strokeWidth="2.5" strokeLinecap="round" />
        )}
        {expression === "curious" && (
          <ellipse cx="50" cy="70" rx="4" ry="5" fill={outline} />
        )}
        {expression === "gentle" && (
          <path d="M38 70 Q50 76 62 70" fill="none" stroke={outline} strokeWidth="2.5" strokeLinecap="round" />
        )}
        {expression === "neutral" && (
          <path d="M40 70 L60 70" fill="none" stroke={outline} strokeWidth="2.5" strokeLinecap="round" />
        )}
        {/* Yellow backpack */}
        <rect x="64" y="62" width="16" height="13" rx="2" fill={pipBackpackShadow} />
        <rect x="62" y="60" width="16" height="13" rx="2" fill={pipBackpack} stroke={outline} strokeWidth="2" />
        <path d="M66 60 L70 52 L74 60" fill={pipBackpack} stroke={outline} strokeWidth="1.5" />
      </svg>
    </motion.div>
  );
}
