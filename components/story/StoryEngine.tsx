"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadBook } from "@/lib/story/loader";
import { getResumePage, markCompleted, saveProgress } from "@/lib/story/progress";
import type { BookBundle } from "@/lib/story/loader";
import { BackButton } from "@/components/layout/BackButton";
import { StoryControls } from "./StoryControls";
import { StoryPage } from "./StoryPage";
import { StoryProgress } from "./StoryProgress";
import { Typography } from "@/components/ui/Typography";

interface StoryEngineProps {
  bookId: string;
}

export function StoryEngine({ bookId }: StoryEngineProps) {
  const router = useRouter();
  const [book, setBook] = useState<BookBundle | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const bundle = await loadBook(bookId);
        if (!active) return;
        const resume = await getResumePage(bookId, bundle.story.pages.length);
        setBook(bundle);
        setPageIndex(resume);
      } catch {
        if (active) setError("We couldn't open this story right now.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void init();
    return () => {
      active = false;
    };
  }, [bookId]);

  const persist = useCallback(
    async (index: number) => {
      await saveProgress(bookId, index);
    },
    [bookId],
  );

  const goNext = useCallback(async () => {
    if (!book) return;
    const isLast = pageIndex >= book.story.pages.length - 1;
    if (isLast) {
      await markCompleted(bookId);
      router.push(`/story/${bookId}/wonder`);
      return;
    }
    const next = pageIndex + 1;
    setPageIndex(next);
    await persist(next);
  }, [book, bookId, pageIndex, persist, router]);

  const goPrevious = useCallback(async () => {
    if (pageIndex <= 0) return;
    const prev = pageIndex - 1;
    setPageIndex(prev);
    await persist(prev);
  }, [pageIndex, persist]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Typography variant="subtitle">Opening story…</Typography>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <Typography variant="subtitle">{error ?? "Story not found."}</Typography>
        <BackButton href="/backpack" />
      </div>
    );
  }

  const page = book.story.pages[pageIndex];
  const isLastPage = pageIndex >= book.story.pages.length - 1;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-2">
        <BackButton href="/backpack" />
      </div>
      <Typography variant="label" className="mb-2">
        {book.meta.title}
      </Typography>
      <StoryProgress total={book.story.pages.length} current={pageIndex} />
      <StoryPage bookId={bookId} page={page} transition={book.story.transition} />
      <StoryControls
        canGoPrevious={pageIndex > 0}
        isLastPage={isLastPage}
        onPrevious={goPrevious}
        onNext={goNext}
      />
    </div>
  );
}
