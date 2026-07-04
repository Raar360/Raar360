"use client";

import type { Activity } from "@/types";
import { TapExplore } from "./activities/TapExplore";
import { Typography } from "@/components/ui/Typography";

interface ActivityRendererProps {
  bookId: string;
  activity: Activity;
}

export function ActivityRenderer({ bookId, activity }: ActivityRendererProps) {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="label">{activity.title}</Typography>
      {activity.type === "tap-explore" && (
        <TapExplore bookId={bookId} activity={activity} />
      )}
      {activity.type === "drag-explore" && (
        <Typography variant="subtitle">Drag and explore — everything is welcome here.</Typography>
      )}
      {activity.type === "draw-space" && (
        <Typography variant="subtitle">{activity.prompt}</Typography>
      )}
    </div>
  );
}
