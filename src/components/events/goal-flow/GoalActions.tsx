
import { Button } from '@/components/ui/button';

interface GoalActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit?: () => void;
  showSubmit?: boolean;
}

export function GoalActions({ isSubmitting, onCancel, onSubmit, showSubmit = false }: GoalActionsProps) {
  return (
    <div className="mt-6 flex justify-between">
      <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      
      {showSubmit && onSubmit && (
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Goal'}
        </Button>
      )}
    </div>
  );
}
