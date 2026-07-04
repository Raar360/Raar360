import { ProgressDots } from "@/components/ui/ProgressDots";

interface StoryProgressProps {
  total: number;
  current: number;
}

export function StoryProgress({ total, current }: StoryProgressProps) {
  return <ProgressDots total={total} current={current} className="py-4" />;
}
