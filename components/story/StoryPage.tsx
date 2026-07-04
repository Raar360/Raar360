"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { StoryPage as StoryPageType, StoryTransition } from "@/types";
import { Pip } from "@/components/characters/Pip";
import { StoryIllustration } from "./StoryIllustration";
import { StoryText } from "./StoryText";
import { ScenePreview } from "@/components/scene/ScenePreview";
import { pageVariants } from "@/lib/utils/motion";
import { toPipExpression } from "@/lib/scene/characters";

interface StoryPageProps {
  bookId: string;
  page: StoryPageType;
  transition: StoryTransition;
}

export function StoryPage({ bookId, page, transition }: StoryPageProps) {
  const reduceMotion = useReducedMotion();
  const variant = pageVariants[transition];
  const alt = page.text.split(".")[0];

  const pipOverlayExpression =
    page.pipExpression ??
    page.scene?.characters.find((c) => c.character === "pip")?.expression;

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
        {page.scene ? (
          <ScenePreview scene={page.scene} alt={alt} />
        ) : page.illustration ? (
          <StoryIllustration bookId={bookId} src={page.illustration} alt={alt} />
        ) : (
          <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-cream-shadow" />
        )}
        <StoryText text={page.text} />
        {pipOverlayExpression && !page.scene && (
          <div className="flex justify-end">
            <Pip expression={toPipExpression(pipOverlayExpression)} size="sm" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
