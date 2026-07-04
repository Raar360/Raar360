"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchLibrary } from "@/lib/story/loader";
import { StoryObject } from "@/components/library/StoryObject";
import { Typography } from "@/components/ui/Typography";
import type { LibraryBookEntry } from "@/types";

export function HomeStoryList() {
  const router = useRouter();
  const [books, setBooks] = useState<LibraryBookEntry[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    void fetchLibrary()
      .then((library) => setBooks(library.books.filter((b) => b.enabled).sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <Typography variant="subtitle" className="text-center text-sm opacity-80">
        Stories couldn&apos;t load — try tapping &quot;Choose a story&quot; below.
      </Typography>
    );
  }

  if (books.length === 0) return null;

  return (
    <div className="w-full max-w-md space-y-3 pt-4">
      <Typography variant="label" className="text-center normal-case tracking-normal">
        Stories waiting inside
      </Typography>
      <div className="grid gap-3">
        {books.map((book) => (
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
    </div>
  );
}
