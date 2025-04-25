
import { useEffect } from 'react';
import { Team, Lines } from '@/types';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import { RosterContainer } from './lineup/RosterContainer';
import { toast } from 'sonner';

interface RosterDragDropProps {
  team: Team;
  onSave: (lines: Lines) => Promise<void>;
  isSaving?: boolean;
}

export default function RosterDragDrop({ team, onSave, isSaving = false }: RosterDragDropProps) {
  const {
    lines,
    setLines,
    availablePlayers,
    handlePlayerMove,
    addForwardLine,
    addDefenseLine,
    isLoading
  } = useLineupEditor(team);

  // Enhanced auto-save with better feedback
  useEffect(() => {
    // Don't trigger save during initial loading
    if (isLoading) {
      return;
    }
    
    console.log("Lineup changed, scheduling auto-save", lines);

    const saveLines = async () => {
      try {
        console.log("Auto-saving lineup...");
        await onSave(lines);
        console.log("Auto-save completed");
      } catch (error) {
        console.error("Error auto-saving lineup:", error);
        toast.error("Failed to save lineup");
      }
    };
    
    const timeoutId = setTimeout(() => {
      saveLines();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [lines, onSave, isLoading]);

  return (
    <RosterContainer
      team={team}
      lines={lines}
      availablePlayers={availablePlayers}
      handlePlayerMove={handlePlayerMove}
      addForwardLine={addForwardLine}
      addDefenseLine={addDefenseLine}
    />
  );
}
