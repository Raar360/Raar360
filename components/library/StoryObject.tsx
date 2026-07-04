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
  onSelect: (bookId: string) => void;
}

export function StoryObject({
  bookId,
  object,
  title,
  subtitle,
  onSelect,
}: StoryObjectProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(bookId)}
      className="group text-left outline-none focus-visible:ring-2 focus-visible:ring-golden/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      <Card
        className={cn(
          "flex h-full flex-col items-center gap-3 transition-transform group-hover:-translate-y-1 group-hover:border-golden/40",
        )}
      >
        <span className="text-5xl" aria-hidden>
          {objectIcons[object]}
        </span>
        <Typography variant="label" className="normal-case tracking-normal text-center">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle" className="text-center text-sm md:text-base">
            {subtitle}
          </Typography>
        )}
      </Card>
    </button>
  );
}
