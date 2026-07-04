"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { StoryPage as StoryPageType, StoryTransition } from "@/types";
import { Pip } from "@/components/characters/Pip";
import { StoryIllustration } from "./StoryIllustration";
import { StoryText } from "./StoryText";
import { pageVariants } from "@/lib/utils/motion";

interface StoryPageProps {
  bookId: string;
  page: StoryPageType;
  transition: StoryTransition;
}

export function StoryPage({ bookId, page, transition }: StoryPageProps) {
  const reduceMotion = useReducedMotion();
  const variant = pageVariants[transition];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page.id}
        initial={reduceMotion ? false : variant.initial}
        animate={variant.animate}
        exit={reduceMotion ? undefined : variant.exit}
        transition={variant.transition}
        className="flex flex-col gap-6"
      >
        <StoryIllustration
          bookId={bookId}
          src={page.illustration}
          alt={page.text.split(".")[0]}
        />
        <StoryText text={page.text} />
        {page.pipExpression && (
          <div className="flex justify-end">
            <Pip expression={page.pipExpression} size="sm" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
