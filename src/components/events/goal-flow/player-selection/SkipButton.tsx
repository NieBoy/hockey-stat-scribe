
import { Button } from '@/components/ui/button';

interface SkipButtonProps {
  onSkip: () => void;
  text?: string;
}

export function SkipButton({ onSkip, text = "Skip" }: SkipButtonProps) {
  return (
    <div className="flex justify-end mt-4">
      <Button variant="ghost" onClick={onSkip}>
        {text}
      </Button>
    </div>
  );
}
