import { Typography } from "@/components/ui/Typography";

interface StoryTextProps {
  text: string;
}

export function StoryText({ text }: StoryTextProps) {
  return (
    <Typography variant="story" as="p" className="px-1">
      {text}
    </Typography>
  );
}
