
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface GoalActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit?: () => void;
  showSubmit?: boolean;
}

export function GoalActions({ isSubmitting, onCancel, onSubmit, showSubmit = false }: GoalActionsProps) {
  return (
    <div className="mt-6 flex justify-between">
      <Button 
        variant="ghost" 
        onClick={onCancel} 
        disabled={isSubmitting}
        className="flex items-center gap-1"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
      
      {showSubmit && onSubmit && (
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Goal'}
        </Button>
      )}
    </div>
  );
}
