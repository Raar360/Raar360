"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { WonderCarousel } from "@/components/wonder/WonderCarousel";
import { Typography } from "@/components/ui/Typography";
import { BackButton } from "@/components/layout/BackButton";
import { loadBook } from "@/lib/story/loader";
import type { Coach } from "@/types";

export default function WonderPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadBook(bookId)
      .then((book) => setCoach(book.coach))
      .finally(() => setLoading(false));
  }, [bookId]);

  return (
    <AppShell showFooter={false}>
      {loading && <Typography variant="subtitle">Loading…</Typography>}
      {!loading && coach && <WonderCarousel bookId={bookId} coach={coach} />}
      {!loading && !coach && (
        <>
          <Typography variant="subtitle">Could not load wonder cards.</Typography>
          <BackButton href={`/story/${bookId}`} />
        </>
      )}
    </AppShell>
  );
}
