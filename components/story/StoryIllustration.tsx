"use client";

import Image from "next/image";
import { getIllustrationUrl } from "@/lib/utils/assets";
import { cn } from "@/lib/utils/cn";

interface StoryIllustrationProps {
  bookId: string;
  src: string;
  alt: string;
  className?: string;
}

export function StoryIllustration({ bookId, src, alt, className }: StoryIllustrationProps) {
  const url = getIllustrationUrl(bookId, src);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-soft border-2 border-outline/15 bg-white/50 shadow-gentle",
        "aspect-[4/5] max-h-[min(52dvh,420px)] sm:max-h-none",
        className,
      )}
    >
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 640px"
        priority
      />
    </div>
  );
}
