import { Typography } from "@/components/ui/Typography";
import { Pip } from "@/components/characters/Pip";

interface PocketReflectionProps {
  reflection: string;
  pipLine?: string;
}

export function PocketReflection({ reflection, pipLine }: PocketReflectionProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 text-center">
      <Typography variant="label">Pip&apos;s Pocket</Typography>
      <Pip expression="gentle" size="lg" />
      <Typography variant="pocket" className="max-w-lg">
        {reflection}
      </Typography>
      {pipLine && (
        <Typography variant="subtitle" className="max-w-md italic opacity-90">
          {pipLine}
        </Typography>
      )}
    </div>
  );
}
