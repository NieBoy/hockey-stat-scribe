
import { useState } from 'react';
import { Team, Lines, Position, User } from '@/types';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import { RosterContainer } from './lineup/RosterContainer';
import { Button } from '../ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { PlayerSelectionModal } from './lineup/PlayerSelectionModal';

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
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    isLoading
  } = useLineupEditor(team);

  const [selectedLineType, setSelectedLineType] = useState<'forwards' | 'defense' | 'goalies' | null>(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);

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

  const handlePositionClick = (
    lineType: 'forwards' | 'defense' | 'goalies', 
    lineIndex: number, 
    position: Position, 
    player: User | null
  ) => {
    console.log(`Position clicked: ${lineType}, line ${lineIndex}, position ${position}`);
    setSelectedLineType(lineType);
    setSelectedLineIndex(lineIndex);
    setSelectedPosition(position);
    setSelectedPlayer(player);
  };

  const closePlayerSelection = () => {
    setSelectedLineType(null);
    setSelectedPosition(null);
    setSelectedPlayer(null);
  };

  const handlePlayerSelected = (playerId: string) => {
    if (!selectedLineType || !selectedPosition) return;
    
    console.log(`Selected player ${playerId} for ${selectedLineType}, line ${selectedLineIndex}, position ${selectedPosition}`);
    handlePlayerSelect(selectedLineType, selectedLineIndex, selectedPosition, playerId);
    closePlayerSelection();
  };

  // Simplified player move handler that no longer relies on drag and drop
  const handlePlayerMoveAdapter = (
    playerId: string, 
    targetLineType: 'forwards' | 'defense' | 'goalies', 
    targetLineIndex: number, 
    targetPosition: Position
  ) => {
    // Find the player
    const player = availablePlayers.find(p => p.id === playerId);
    if (!player) {
      console.error("Player not found", playerId);
      return;
    }
    
    // Pass to our existing handler
    handlePlayerMove(
      player,
      'forwards', // Default source values, will be overridden
      0,
      'LW' as Position,
      targetLineType,
      targetLineIndex,
      targetPosition
    );
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
        handlePlayerMove={handlePlayerMoveAdapter}
        addForwardLine={addForwardLine}
        addDefenseLine={addDefenseLine}
        onPositionClick={handlePositionClick}
      />

      {selectedLineType && selectedPosition && (
        <PlayerSelectionModal
          currentTab={selectedLineType}
          selectedLineIndex={selectedLineIndex}
          selectedPosition={selectedPosition}
          currentPlayer={selectedPlayer}
          availablePlayers={availablePlayers}
          onPlayerSelect={handlePlayerSelected}
          onCancel={closePlayerSelection}
        />
      )}
    </div>
  );
}
