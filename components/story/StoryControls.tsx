import { Button } from "@/components/ui/Button";

interface StoryControlsProps {
  onPrevious?: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  isLastPage: boolean;
}

export function StoryControls({
  onPrevious,
  onNext,
  canGoPrevious,
  isLastPage,
}: StoryControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      {canGoPrevious ? (
        <Button variant="ghost" size="sm" onClick={onPrevious}>
          Back
        </Button>
      ) : (
        <div />
      )}
      <Button variant="primary" onClick={onNext}>
        {isLastPage ? "Wonder Together" : "Continue"}
      </Button>
    </div>
  );
}
