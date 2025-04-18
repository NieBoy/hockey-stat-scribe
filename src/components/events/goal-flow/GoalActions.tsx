
import { Button } from '@/components/ui/button';

interface GoalActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function GoalActions({ isSubmitting, onCancel }: GoalActionsProps) {
  return (
    <div className="mt-6 flex justify-between">
      <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
    </div>
  );
}
