import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils/cn";

interface StoryTextProps {
  text: string;
}

export function StoryText({ text }: StoryTextProps) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <div
      className={cn(
        "max-h-[38dvh] overflow-y-auto rounded-xl border-2 border-outline/20 bg-white/90 px-4 py-4 shadow-gentle",
        "sm:max-h-none sm:px-5 sm:py-5",
      )}
    >
      <div className="space-y-3">
        {paragraphs.map((paragraph, index) => (
          <Typography key={index} variant="story" as="p" className="text-base sm:text-xl">
            {paragraph}
          </Typography>
        ))}
      </div>
    </div>
  );
}
