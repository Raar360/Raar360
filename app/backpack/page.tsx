"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/layout/BackButton";
import { StoryObjectGrid } from "@/components/library/StoryObjectGrid";
import { Typography } from "@/components/ui/Typography";
import { fetchLibrary } from "@/lib/story/loader";
import { getAllProgress, type Progress } from "@/lib/story/progress";
import type { LibraryBookEntry } from "@/types";

export default function BackpackPage() {
  const [books, setBooks] = useState<LibraryBookEntry[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([fetchLibrary(), getAllProgress()])
      .then(([library, progressList]) => {
        setBooks(library.books.filter((b) => b.enabled));
        setProgressMap(
          progressList.reduce<Record<string, Progress>>((acc, item) => {
            acc[item.bookId] = item;
            return acc;
          }, {}),
        );
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <BackButton href="/" label="Home" />
      <Typography variant="title" as="h1" className="mt-4 mb-2">
        Choose a Story
      </Typography>
      <Typography variant="subtitle" className="mb-6 sm:mb-8">
        Each object holds a story waiting inside.
      </Typography>
      {loading ? (
        <Typography variant="subtitle">Loading stories…</Typography>
      ) : books.length === 0 ? (
        <Typography variant="subtitle">
          No stories found. Pull down to refresh, or check your connection.
        </Typography>
      ) : (
        <StoryObjectGrid books={books} progressMap={progressMap} />
      )}
    </AppShell>
  );
}
