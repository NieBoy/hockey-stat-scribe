
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatTypeSelector } from './StatTypeSelector';
import { StatAssignment } from '@/hooks/useStatTrackerAssignment';

interface StatTrackerAssignmentFormProps {
  selectedTrackers: StatAssignment;
  teamMembers: any[];
  loading: boolean;
  saveSuccess: boolean;
  onSelect: (statType: string, value: string) => void;
  onSave: () => void;
}

export const StatTrackerAssignmentForm = ({
  selectedTrackers,
  teamMembers,
  loading,
  saveSuccess,
  onSelect,
  onSave
}: StatTrackerAssignmentFormProps) => {
  return (
    <Card className="p-6">
      <StatTypeSelector
        selectedTrackers={selectedTrackers}
        teamMembers={teamMembers}
        onSelect={onSelect}
      />

      <Button 
        onClick={onSave}
        className="mt-6 w-full"
        size="lg"
        disabled={loading}
      >
        {loading ? 'Saving...' : saveSuccess ? 'Saved Successfully' : 'Save Assignments'}
      </Button>
    </Card>
  );
};
