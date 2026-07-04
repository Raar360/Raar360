"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Coach } from "@/types";
import { WonderCard } from "./WonderCard";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/layout/BackButton";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { Typography } from "@/components/ui/Typography";

interface WonderCarouselProps {
  bookId: string;
  coach: Coach;
}

export function WonderCarousel({ bookId, coach }: WonderCarouselProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const questions = coach.wonder.questions;
  const isLast = index >= questions.length - 1;

  const goNext = () => {
    if (isLast) {
      router.push(`/story/${bookId}/play`);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const goPrevious = () => setIndex((i) => Math.max(0, i - 1));

  return (
    <div className="flex flex-1 flex-col">
      <BackButton href={`/story/${bookId}`} label="Back to story" />
      {coach.wonder.intro && index === 0 && (
        <Typography variant="subtitle" className="mt-4 text-center">
          {coach.wonder.intro}
        </Typography>
      )}

      <motion.div
        key={questions[index].id}
        className="flex flex-1 touch-pan-y flex-col"
        drag={reduceMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) goNext();
          else if (info.offset.x > 60) goPrevious();
        }}
      >
        <WonderCard text={questions[index].text} index={index} total={questions.length} />
      </motion.div>

      <Typography variant="label" className="mb-2 text-center normal-case tracking-normal opacity-60">
        Swipe or tap to move between wonders
      </Typography>

      <MobileActionBar>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" disabled={index === 0} onClick={goPrevious} className="shrink-0 sm:w-auto">
            Previous
          </Button>
          <Button variant="primary" onClick={goNext} className="flex-1 sm:flex-none">
            {isLast ? "Play Together" : "Next wonder"}
          </Button>
        </div>
      </MobileActionBar>
    </div>
  );
}
