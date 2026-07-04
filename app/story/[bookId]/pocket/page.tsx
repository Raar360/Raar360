"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PocketReflection } from "@/components/pocket/PocketReflection";
import { BackButton } from "@/components/layout/BackButton";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { loadBook } from "@/lib/story/loader";

export default function PocketPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const router = useRouter();
  const [reflection, setReflection] = useState<string | null>(null);
  const [pipLine, setPipLine] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadBook(bookId)
      .then((book) => {
        setReflection(book.coach.pocket.reflection);
        setPipLine(book.coach.pocket.pipLine);
      })
      .finally(() => setLoading(false));
  }, [bookId]);

  return (
    <AppShell>
      <BackButton href={`/story/${bookId}/play`} label="Back to play" />
      {loading && <Typography variant="subtitle" className="mt-4">Loading…</Typography>}
      {!loading && reflection && (
        <div className="flex flex-1 flex-col">
          <PocketReflection reflection={reflection} pipLine={pipLine} />
          <div className="flex justify-center pb-8">
            <Button onClick={() => router.push("/")}>Finish</Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
