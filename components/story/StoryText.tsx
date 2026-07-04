import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils/cn";

interface StoryTextProps {
  text: string;
}

export function StoryText({ text }: StoryTextProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-outline/20 bg-white/90 px-4 py-4 shadow-gentle",
        "sm:px-5 sm:py-5",
      )}
    >
      <Typography variant="story" as="p">
        {text}
      </Typography>
    </div>
  );
}
