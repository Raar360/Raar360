"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ActivityRenderer } from "@/components/play/ActivityRenderer";
import { BackButton } from "@/components/layout/BackButton";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { loadBook } from "@/lib/story/loader";
import type { Activity } from "@/types";

export default function PlayPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadBook(bookId)
      .then((book) => setActivity(book.activity))
      .finally(() => setLoading(false));
  }, [bookId]);

  return (
    <AppShell showFooter={false}>
      <BackButton href={`/story/${bookId}/wonder`} label="Back to wonder" />
      {loading && <Typography variant="subtitle" className="mt-4">Loading…</Typography>}
      {!loading && activity && (
        <div className="mt-6 flex flex-1 flex-col">
          <ActivityRenderer bookId={bookId} activity={activity} />
          <div className="mt-8 flex justify-end">
            <Button onClick={() => router.push(`/story/${bookId}/pocket`)}>
              Pip&apos;s Pocket
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
