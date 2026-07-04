import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface StoryControlsProps {
  onPrevious?: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  isLastPage: boolean;
  className?: string;
}

export function StoryControls({
  onPrevious,
  onNext,
  canGoPrevious,
  isLastPage,
  className,
}: StoryControlsProps) {
  return (
    <div className={cn("flex items-stretch justify-between gap-3 sm:items-center", className)}>
      {canGoPrevious ? (
        <Button variant="ghost" size="sm" onClick={onPrevious} className="shrink-0 sm:w-auto">
          Back
        </Button>
      ) : (
        <div className="hidden w-20 sm:block" />
      )}
      <Button variant="primary" onClick={onNext} className="flex-1 sm:flex-none">
        {isLastPage ? "Wonder Together" : "Continue"}
      </Button>
    </div>
  );
}
