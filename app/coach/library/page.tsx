"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { fetchLibrary } from "@/lib/story/loader";
import { isCoachSessionActive, clearCoachSession } from "@/lib/coach/auth";
import type { LibraryBookEntry } from "@/types";

export default function CoachLibraryPage() {
  const router = useRouter();
  const [books, setBooks] = useState<LibraryBookEntry[]>([]);

  useEffect(() => {
    if (!isCoachSessionActive()) {
      router.replace("/coach");
      return;
    }
    void fetchLibrary().then((library) => setBooks(library.books));
  }, [router]);

  const handleLogout = () => {
    clearCoachSession();
    router.push("/");
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <BackButton href="/coach" label="Back" />
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-warm-brown/70 underline"
        >
          Lock coach mode
        </button>
      </div>
      <Typography variant="title" as="h1" className="mb-6">
        Story Library
      </Typography>
      <div className="grid gap-4">
        {books.map((book) => (
          <Card key={book.id}>
            <Typography variant="label" className="normal-case">
              {book.title}
            </Typography>
            <Typography variant="subtitle" className="text-sm">
              {book.id} · {book.object}
            </Typography>
          </Card>
        ))}
      </div>
      <Typography variant="subtitle" className="mt-8 text-sm opacity-70">
        Full editing tools arrive in Phase 3. Content is loaded from stories/ JSON files.
      </Typography>
    </AppShell>
  );
}
