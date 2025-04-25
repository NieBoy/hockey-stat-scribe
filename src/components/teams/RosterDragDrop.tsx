
import { useEffect } from 'react';
import { Team, Lines } from '@/types';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import { RosterContainer } from './lineup/RosterContainer';

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
  } = useLineupEditor(team);

  // Auto-save whenever lines change
  useEffect(() => {
    const saveLines = async () => {
      try {
        await onSave(lines);
      } catch (error) {
        console.error("Error auto-saving lineup:", error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      saveLines();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [lines, onSave]);

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
