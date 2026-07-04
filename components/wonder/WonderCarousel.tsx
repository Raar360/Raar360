"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Coach } from "@/types";
import { WonderCard } from "./WonderCard";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/layout/BackButton";
import { Typography } from "@/components/ui/Typography";

interface WonderCarouselProps {
  bookId: string;
  coach: Coach;
}

export function WonderCarousel({ bookId, coach }: WonderCarouselProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const questions = coach.wonder.questions;
  const isLast = index >= questions.length - 1;

  return (
    <div className="flex flex-1 flex-col">
      <BackButton href={`/story/${bookId}`} label="Back to story" />
      {coach.wonder.intro && index === 0 && (
        <Typography variant="subtitle" className="mt-4 text-center">
          {coach.wonder.intro}
        </Typography>
      )}
      <WonderCard text={questions[index].text} index={index} total={questions.length} />
      <div className="flex justify-between gap-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (isLast) {
              router.push(`/story/${bookId}/play`);
            } else {
              setIndex((i) => i + 1);
            }
          }}
        >
          {isLast ? "Play Together" : "Next wonder"}
        </Button>
      </div>
    </div>
  );
}
