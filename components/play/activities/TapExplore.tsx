"use client";

import { useState } from "react";
import type { TapExploreActivity } from "@/types";
import { getIllustrationUrl } from "@/lib/utils/assets";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import Image from "next/image";

interface TapExploreProps {
  bookId: string;
  activity: TapExploreActivity;
}

export function TapExplore({ bookId, activity }: TapExploreProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Typography variant="subtitle">{activity.instructions}</Typography>
      <div className="relative aspect-[4/3] max-h-[min(45dvh,360px)] w-full overflow-hidden rounded-soft border-2 border-outline/15 sm:max-h-none">
        <Image
          src={getIllustrationUrl(bookId, activity.background)}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        {activity.hotspots.map((spot) => (
          <button
            key={spot.id}
            type="button"
            aria-label={spot.label ?? "Explore"}
            onClick={() => toggle(spot.id)}
            className="absolute min-h-12 min-w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-golden/80 bg-golden/40 p-3 backdrop-blur-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          />
        ))}
      </div>
      <div className="grid gap-3">
        {activity.hotspots
          .filter((spot) => revealed.has(spot.id))
          .map((spot) => (
            <Card key={spot.id}>
              <Typography variant="story" className="text-base">
                {spot.revealText}
              </Typography>
            </Card>
          ))}
      </div>
    </div>
  );
}
