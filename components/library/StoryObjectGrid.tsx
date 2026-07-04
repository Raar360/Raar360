"use client";

import { useRouter } from "next/navigation";
import type { LibraryBookEntry } from "@/types";
import { StoryObject } from "./StoryObject";

interface StoryObjectGridProps {
  books: LibraryBookEntry[];
}

export function StoryObjectGrid({ books }: StoryObjectGridProps) {
  const router = useRouter();

  const sorted = [...books].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
      {sorted.map((book) => (
        <StoryObject
          key={book.id}
          bookId={book.id}
          object={book.object}
          title={book.title}
          subtitle={book.subtitle}
          onSelect={(id) => router.push(`/story/${id}`)}
        />
      ))}
    </div>
  );
}
