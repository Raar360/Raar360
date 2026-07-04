import type { StoryObjectType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils/cn";

const objectIcons: Record<StoryObjectType, string> = {
  "green-brick": "🧱",
  radio: "📻",
  wall: "🧱",
  volcano: "🌋",
  backpack: "🎒",
  "treasure-map": "🗺️",
  battery: "🔋",
  "puzzle-piece": "🧩",
  compass: "🧭",
};

interface StoryObjectProps {
  bookId: string;
  object: StoryObjectType;
  title: string;
  subtitle?: string;
  progressLabel?: string | null;
  onSelect: (bookId: string) => void;
}

export function StoryObject({
  bookId,
  object,
  title,
  subtitle,
  progressLabel,
  onSelect,
}: StoryObjectProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(bookId)}
      className="group min-h-[140px] w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-golden/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:scale-[0.98] transition-transform"
    >
      <Card
        className={cn(
          "relative flex h-full flex-col items-center gap-2 p-4 transition-transform group-hover:-translate-y-0.5 group-hover:border-golden/40 sm:gap-3 sm:p-6",
        )}
      >
        {progressLabel && (
          <span className="absolute top-2 right-2 rounded-full bg-golden/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-outline sm:text-xs">
            {progressLabel}
          </span>
        )}
        <span className="text-4xl sm:text-5xl" aria-hidden>
          {objectIcons[object]}
        </span>
        <Typography variant="label" className="line-clamp-2 normal-case tracking-normal text-center">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle" className="line-clamp-2 text-center text-sm sm:text-base">
            {subtitle}
          </Typography>
        )}
      </Card>
    </button>
  );
}
