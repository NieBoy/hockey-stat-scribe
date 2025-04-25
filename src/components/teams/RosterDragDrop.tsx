
import { Team, Lines } from '@/types';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import { RosterContainer } from './lineup/RosterContainer';
import { Button } from '../ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface RosterDragDropProps {
  team: Team;
  onSave: (lines: Lines) => Promise<void>;
  isSaving?: boolean;
}

export default function RosterDragDrop({ team, onSave, isSaving = false }: RosterDragDropProps) {
  const {
    lines,
    availablePlayers,
    handlePlayerMove,
    addForwardLine,
    addDefenseLine,
    isLoading
  } = useLineupEditor(team);

  const handleSave = async () => {
    try {
      console.log("Saving lineup...");
      await onSave(lines);
      toast.success("Lineup saved successfully");
    } catch (error) {
      console.error("Error saving lineup:", error);
      toast.error("Failed to save lineup");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Lineup'}
        </Button>
      </div>

      <RosterContainer
        team={team}
        lines={lines}
        availablePlayers={availablePlayers}
        handlePlayerMove={handlePlayerMove}
        addForwardLine={addForwardLine}
        addDefenseLine={addDefenseLine}
      />
    </div>
  );
}
