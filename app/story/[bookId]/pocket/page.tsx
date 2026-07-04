"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PocketReflection } from "@/components/pocket/PocketReflection";
import { BackButton } from "@/components/layout/BackButton";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
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
    <AppShell showFooter={false}>
      <BackButton href={`/story/${bookId}/play`} label="Back to play" />
      {loading && <Typography variant="subtitle" className="mt-4">Loading…</Typography>}
      {!loading && reflection && (
        <div className="flex flex-1 flex-col">
          <PocketReflection reflection={reflection} pipLine={pipLine} />
          <MobileActionBar>
            <Button onClick={() => router.push("/")} className="w-full">
              Finish
            </Button>
          </MobileActionBar>
        </div>
      )}
    </AppShell>
  );
}
