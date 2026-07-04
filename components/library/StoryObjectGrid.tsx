"use client";

import { useRouter } from "next/navigation";
import type { LibraryBookEntry } from "@/types";
import type { Progress } from "@/lib/story/progress";
import { getProgressLabel } from "@/lib/story/progress";
import { StoryObject } from "./StoryObject";

interface StoryObjectGridProps {
  books: LibraryBookEntry[];
  progressMap: Record<string, Progress>;
}

export function StoryObjectGrid({ books, progressMap }: StoryObjectGridProps) {
  const router = useRouter();

  const sorted = [...books].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
      {sorted.map((book) => (
        <StoryObject
          key={book.id}
          bookId={book.id}
          object={book.object}
          title={book.title}
          subtitle={book.subtitle}
          progressLabel={getProgressLabel(progressMap[book.id])}
          onSelect={(id) => router.push(`/story/${id}`)}
        />
      ))}
    </div>
  );
}
