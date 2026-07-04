"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/layout/BackButton";
import { StoryObjectGrid } from "@/components/library/StoryObjectGrid";
import { Typography } from "@/components/ui/Typography";
import { fetchLibrary } from "@/lib/story/loader";
import type { LibraryBookEntry } from "@/types";

export default function BackpackPage() {
  const [books, setBooks] = useState<LibraryBookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchLibrary()
      .then((library) => setBooks(library.books.filter((b) => b.enabled)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <BackButton href="/" label="Home" />
      <Typography variant="title" as="h1" className="mt-4 mb-2">
        Choose a Story
      </Typography>
      <Typography variant="subtitle" className="mb-8">
        Each object holds a story waiting inside.
      </Typography>
      {loading ? (
        <Typography variant="subtitle">Loading stories…</Typography>
      ) : (
        <StoryObjectGrid books={books} />
      )}
    </AppShell>
  );
}
