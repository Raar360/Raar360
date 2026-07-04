import { Typography } from "@/components/ui/Typography";
import { Pip } from "@/components/characters/Pip";

interface WonderCardProps {
  text: string;
  index: number;
  total: number;
}

export function WonderCard({ text, index, total }: WonderCardProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 text-center">
      <Typography variant="label">
        Wonder {index + 1} of {total}
      </Typography>
      <Typography variant="wonder" as="h2" className="max-w-2xl">
        {text}
      </Typography>
      <Pip expression="curious" />
      <Typography variant="subtitle" className="max-w-md text-base opacity-80">
        There are no right answers — just wonder together.
      </Typography>
    </div>
  );
}
