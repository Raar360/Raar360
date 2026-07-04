"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { gentleEase } from "@/lib/utils/motion";

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
}

export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div key={transitionKey}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, ease: gentleEase }}
        className="flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
